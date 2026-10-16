import { createResourceServerChallenge } from "@better-auth/oauth-provider";
import { createMcpHandler, type AuthInfo } from "@modelcontextprotocol/server";
import { APIError } from "better-auth/api";
import {
  createDpopReplayStore,
  enforceDpopBinding,
  isDpopBindingError,
  parseAccessTokenAuthorization,
  verifyJwsAccessToken,
} from "better-auth/oauth2";
import { eq } from "drizzle-orm";

import { users } from "../schema/auth";
import { auth, MCP_ISSUER, MCP_RESOURCE } from "../utils/auth";
import { db } from "../utils/db";
import { mcpServer } from "./tools";

const unauthorized = (message: string) =>
  new APIError("UNAUTHORIZED", { message, error: "invalid_token", error_description: message });

/**
 * Verifies the request's access token like `verifyAccessTokenRequest` from better-auth/oauth2,
 * but reads the signing keys in process. That helper only takes a JWKS URL, and fetching our own
 * URL from inside the Worker is a network round trip at best and unreachable in tests.
 */
async function verifyAccessToken(request: Request) {
  const authorization = parseAccessTokenAuthorization(request.headers.get("authorization"));
  if (!authorization?.token)
    throw new APIError("UNAUTHORIZED", { message: "missing authorization header" });
  if (authorization.scheme === "Unknown") {
    throw unauthorized("authorization scheme must be Bearer or DPoP");
  }
  const jwks = await auth.api.getJwks();
  const claims = await verifyJwsAccessToken(authorization.token, {
    jwksFetch: async () => jwks,
    verifyOptions: { issuer: MCP_ISSUER, audience: MCP_RESOURCE },
  }).catch(() => {
    throw unauthorized("invalid access token");
  });
  try {
    await enforceDpopBinding({
      payload: claims,
      authorization,
      proofJwt: request.headers.get("dpop"),
      method: request.method,
      url: request.url,
      replayStore: createDpopReplayStore((await auth.$context).internalAdapter),
    });
  } catch (error) {
    if (!isDpopBindingError(error)) throw error;
    throw new APIError("UNAUTHORIZED", {
      message: error.message,
      error: error.code,
      error_description: error.message,
    });
  }

  const [user] = claims.sub
    ? await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, claims.sub))
    : [];
  if (!user) throw unauthorized("invalid access token");

  const authInfo: AuthInfo = {
    token: authorization.token,
    clientId: String(claims.client_id ?? claims.azp),
    scopes: typeof claims.scope === "string" ? claims.scope.split(" ") : [],
    expiresAt: claims.exp,
    resource: new URL(MCP_RESOURCE),
  };
  return { user, authInfo };
}

/** Serves `/mcp` to agents holding an access token from the MCP OAuth flow. */
export async function serveMcp(request: Request) {
  let verified;
  try {
    verified = await verifyAccessToken(request);
  } catch (error) {
    const challenge = createResourceServerChallenge(error, MCP_RESOURCE);
    if (!challenge) throw error;
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32000, message: challenge.message }, id: null },
      { status: challenge.statusCode, headers: challenge.headers },
    );
  }
  const { user, authInfo } = verified;
  // Each request is served by a fresh server for its user. Nothing is streamed, so the default
  // response mode already answers with one JSON body.
  return createMcpHandler(() => mcpServer(user), { legacy: "stateless" }).fetch(request, {
    authInfo,
  });
}
