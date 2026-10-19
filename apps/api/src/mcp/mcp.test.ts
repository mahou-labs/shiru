import {
  Client,
  StreamableHTTPClientTransport,
  type OAuthClientProvider,
} from "@modelcontextprotocol/client";
import { deriveDpopAth, deriveDpopJkt } from "better-auth/oauth2";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { buildCommit } from "../docs/git";
import app from "../index";
import { artifacts, flushWaitUntil } from "../test/bindings";
import { createClient } from "../test/client";
import { auth, MCP_ISSUER, MCP_RESOURCE } from "../utils/auth";

const JAN_1 = new Date("2026-01-01T00:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(JAN_1);
});
afterEach(() => vi.useRealTimers());

const MCP_URL = new URL("http://localhost:3000/mcp");
const CALLBACK = "http://localhost:33418/callback";

const callApp = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await app.request(new Request(input, init));
  await flushWaitUntil();
  return response;
};

/** An agent's OAuth state, kept in memory the way a CLI keeps it on disk. */
function agentProvider() {
  const state: {
    client?: Awaited<ReturnType<OAuthClientProvider["clientInformation"]>>;
    tokens?: Awaited<ReturnType<OAuthClientProvider["tokens"]>>;
    verifier?: string;
    discovery?: Awaited<ReturnType<NonNullable<OAuthClientProvider["discoveryState"]>>>;
    authorizationUrl?: URL;
  } = {};
  const provider: OAuthClientProvider = {
    redirectUrl: CALLBACK,
    clientMetadata: {
      client_name: "Test Agent",
      redirect_uris: [CALLBACK],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    clientInformation: () => state.client,
    saveClientInformation: (client) => void (state.client = client),
    tokens: () => state.tokens,
    saveTokens: (tokens) => void (state.tokens = tokens),
    redirectToAuthorization: (url) => void (state.authorizationUrl = url),
    saveCodeVerifier: (verifier) => void (state.verifier = verifier),
    codeVerifier: () => state.verifier!,
    saveDiscoveryState: (discovery) => void (state.discovery = discovery),
    discoveryState: () => state.discovery,
  };
  return { provider, state };
}

async function siteOwner(email: string, slug: string) {
  const browser = createClient();
  await browser.signUpVerified(email, "Ada");
  await browser.createOrganization(`Org ${slug}`);
  const { body } = await browser.rpc("docs/create", {
    slug,
    name: "Acme Docs",
    visibility: "public",
  });
  return { browser, docId: (body.json as { id: string }).id };
}

/**
 * Connects an agent the way `claude mcp add` does: the first request is refused, the agent
 * registers and sends the user to authorize, the signed-in user consents, and the agent trades the
 * code for a token.
 */
async function connectAgent(browser: ReturnType<typeof createClient>, scope?: string) {
  const { provider, state } = agentProvider();
  const transport = () =>
    new StreamableHTTPClientTransport(MCP_URL, { authProvider: provider, fetch: callApp });

  await expect(
    new Client({ name: "agent", version: "1.0.0" }).connect(transport()),
  ).rejects.toThrow("Unauthorized");

  const authorize = await browser.request(state.authorizationUrl!.href);
  const consentPage = new URL(authorize.headers.get("location")!);
  expect(`${consentPage.origin}${consentPage.pathname}`).toBe(
    "http://localhost:3001/oauth/consent",
  );

  const consent = await browser.post("/auth/oauth2/consent", {
    accept: true,
    ...(scope && { scope }),
    oauth_query: consentPage.search.slice(1),
  });
  const { url } = (await consent.json()) as { url: string };
  const callback = new URL(url);
  expect(`${callback.origin}${callback.pathname}`).toBe(CALLBACK);

  await transport().finishAuth(callback.searchParams);
  const agent = new Client({ name: "agent", version: "1.0.0" });
  await agent.connect(transport());
  return { agent, state };
}

/** Pushes a first commit to the doc's repo, as a developer with a repo token could. */
async function pushFirstCommit(repo: string, files: Record<string, string>) {
  await artifacts.create(repo);
  const commit = await buildCommit({
    tree: [],
    changes: Object.entries(files).map(([path, content]) => ({
      path,
      op: "put",
      content: new TextEncoder().encode(content),
    })),
    parent: null,
    author: { name: "Dev", email: "dev@example.com" },
    message: "import",
    time: 1760000000,
  });
  artifacts.receive(repo, commit.objects, commit.sha);
  return commit.sha;
}

const result = (value: unknown) => ({
  content: [{ type: "text", text: JSON.stringify(value) }],
  structuredContent: value,
});
const toolError = (text: string) => ({ isError: true, content: [{ type: "text", text }] });

describe("mcp discovery", () => {
  it("answers a request without a token with a challenge that names the resource metadata", async () => {
    const response = await callApp(MCP_URL, { method: "POST", body: "{}" });
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe(
      'Bearer resource_metadata="http://localhost:3000/.well-known/oauth-protected-resource/mcp"',
    );
    expect(await response.json()).toEqual({
      jsonrpc: "2.0",
      error: { code: -32000, message: "missing authorization header" },
      id: null,
    });

    const forged = await callApp(MCP_URL, {
      method: "POST",
      body: "{}",
      headers: { authorization: "Bearer not-a-token" },
    });
    expect(forged.status).toBe(401);
    expect(forged.headers.get("www-authenticate")).toBe(
      'Bearer resource_metadata="http://localhost:3000/.well-known/oauth-protected-resource/mcp"',
    );
    expect(await forged.json()).toEqual({
      jsonrpc: "2.0",
      error: { code: -32000, message: "invalid access token" },
      id: null,
    });

    const basic = await callApp(MCP_URL, {
      method: "POST",
      body: "{}",
      headers: { authorization: "Basic dXNlcjpwYXNz" },
    });
    expect(basic.status).toBe(401);
    expect(await basic.json()).toEqual({
      jsonrpc: "2.0",
      error: { code: -32000, message: "authorization scheme must be Bearer or DPoP" },
      id: null,
    });
  });

  it("serves resource and authorization server metadata at the origin root", async () => {
    const resource = await callApp(
      "http://localhost:3000/.well-known/oauth-protected-resource/mcp",
    );
    expect(await resource.json()).toEqual({
      resource: "http://localhost:3000/mcp",
      authorization_servers: ["http://localhost:3000/auth"],
      bearer_methods_supported: ["header"],
      dpop_signing_alg_values_supported: ["EdDSA", "ES256", "ES512", "PS256", "RS256"],
      scopes_supported: ["docs:read", "docs:write"],
    });

    const server = await callApp(
      "http://localhost:3000/.well-known/oauth-authorization-server/auth",
    );
    expect(await server.json()).toMatchObject({
      issuer: "http://localhost:3000/auth",
      authorization_endpoint: "http://localhost:3000/auth/oauth2/authorize",
      token_endpoint: "http://localhost:3000/auth/oauth2/token",
      registration_endpoint: "http://localhost:3000/auth/oauth2/register",
      scopes_supported: ["offline_access", "docs:read", "docs:write"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
    });
  });
});

/** Calls `list_sites` with the given credentials, as an agent would after connecting. */
const listSites = (headers: Record<string, string>) =>
  callApp(MCP_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...headers,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "list_sites", arguments: {} },
    }),
  });

const rejection = (message: string) => ({
  jsonrpc: "2.0",
  error: { code: -32000, message },
  id: null,
});

async function signedInUser(email: string) {
  const browser = createClient();
  await browser.signUpVerified(email, "Ada");
  const session = await (await browser.request("/auth/get-session")).json();
  return { browser, userId: (session as { user: { id: string } }).user.id };
}

/** Signs an access token with the server's own keys, for claims the OAuth flow never issues. */
const signAccessToken = async (payload: Record<string, unknown>) =>
  (
    await auth.api.signJWT({
      body: {
        payload: { iss: MCP_ISSUER, aud: MCP_RESOURCE, scope: "docs:read", ...payload },
      },
    })
  ).token;

const base64url = (value: string | ArrayBuffer) =>
  Buffer.from(
    typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value),
  ).toString("base64url");

/** A DPoP key pair, and proofs of possession for requests to `/mcp` (RFC 9449). */
async function dpopKey() {
  const { privateKey, publicKey } = (await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign", "verify"],
  )) as CryptoKeyPair;
  const { kty, crv, x, y } = (await crypto.subtle.exportKey("jwk", publicKey)) as JsonWebKey;
  const jwk = { kty, crv, x, y };
  return {
    jkt: await deriveDpopJkt(jwk),
    async proof(accessToken: string) {
      const header = base64url(JSON.stringify({ typ: "dpop+jwt", alg: "ES256", jwk }));
      const claims = base64url(
        JSON.stringify({
          htm: "POST",
          htu: MCP_URL.href,
          iat: Math.floor(Date.now() / 1000),
          jti: crypto.randomUUID(),
          ath: await deriveDpopAth(accessToken),
        }),
      );
      const signature = await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        privateKey,
        new TextEncoder().encode(`${header}.${claims}`),
      );
      return `${header}.${claims}.${base64url(signature)}`;
    },
  };
}

describe("mcp access tokens", () => {
  it("rejects an access token once it expires", async () => {
    const { browser } = await siteOwner("token-expiry@mailinator.com", "token-expiry");
    const { state } = await connectAgent(browser);
    const authorization = `Bearer ${state.tokens!.access_token}`;

    expect(state.tokens!.expires_in).toBe(3600);
    vi.setSystemTime(JAN_1.getTime() + 3599 * 1000);
    expect((await listSites({ authorization })).status).toBe(200);

    vi.setSystemTime(JAN_1.getTime() + 3601 * 1000);
    const expired = await listSites({ authorization });
    expect(expired.status).toBe(401);
    expect(expired.headers.get("www-authenticate")).toBe(
      'Bearer resource_metadata="http://localhost:3000/.well-known/oauth-protected-resource/mcp"',
    );
    expect(await expired.json()).toEqual(rejection("invalid access token"));
  });

  it("rejects tokens signed by the server for another issuer or audience", async () => {
    const { browser, userId } = await signedInUser("token-claims@mailinator.com");

    const valid = await listSites({
      authorization: `Bearer ${await signAccessToken({ sub: userId })}`,
    });
    expect(valid.status).toBe(200);

    const otherIssuer = await signAccessToken({ sub: userId, iss: "http://localhost:3000" });
    const otherAudience = await signAccessToken({ sub: userId, aud: "http://localhost:3000" });
    // The session JWT the jwt plugin hands the browser is signed with the same keys.
    const { token: sessionJwt } = (await (await browser.request("/auth/token")).json()) as {
      token: string;
    };
    const noUser = await signAccessToken({ sub: "no-such-user" });
    for (const token of [otherIssuer, otherAudience, sessionJwt, noUser]) {
      const response = await listSites({ authorization: `Bearer ${token}` });
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual(rejection("invalid access token"));
    }
  });

  it("requires a fresh proof from the bound key for a DPoP-bound token", async () => {
    const { userId } = await signedInUser("token-dpop@mailinator.com");
    const key = await dpopKey();
    const token = await signAccessToken({ sub: userId, cnf: { jkt: key.jkt } });

    const asBearer = await listSites({ authorization: `Bearer ${token}` });
    expect(asBearer.status).toBe(401);
    expect(await asBearer.json()).toEqual(
      rejection("DPoP-bound access token requires the DPoP authorization scheme"),
    );

    const withoutProof = await listSites({ authorization: `DPoP ${token}` });
    expect(withoutProof.status).toBe(401);
    expect(await withoutProof.json()).toEqual(rejection("DPoP proof header is required"));

    const otherKey = await dpopKey();
    const wrongKey = await listSites({
      authorization: `DPoP ${token}`,
      dpop: await otherKey.proof(token),
    });
    expect(wrongKey.status).toBe(401);
    expect(await wrongKey.json()).toEqual(
      rejection("DPoP proof key does not match the bound token"),
    );

    const proof = await key.proof(token);
    expect((await listSites({ authorization: `DPoP ${token}`, dpop: proof })).status).toBe(200);
    const replayed = await listSites({ authorization: `DPoP ${token}`, dpop: proof });
    expect(replayed.status).toBe(401);
    expect(await replayed.json()).toEqual(rejection("DPoP proof jti has already been used"));

    const unbound = await signAccessToken({ sub: userId });
    const dpopForBearer = await listSites({
      authorization: `DPoP ${unbound}`,
      dpop: await key.proof(unbound),
    });
    expect(dpopForBearer.status).toBe(401);
    expect(await dpopForBearer.json()).toEqual(
      rejection("DPoP authorization requires a DPoP-bound access token"),
    );
  });
});

describe("mcp tools", () => {
  it("connects an agent through OAuth and lists the user's sites", async () => {
    const { browser, docId } = await siteOwner("agent-owner@mailinator.com", "agent-docs");
    await siteOwner("agent-stranger@mailinator.com", "stranger-docs");
    const { agent, state } = await connectAgent(browser);

    expect(state.tokens).toMatchObject({
      token_type: "Bearer",
      scope: "docs:read docs:write offline_access",
      refresh_token: expect.any(String),
    });
    expect(await agent.callTool({ name: "list_sites", arguments: {} })).toEqual(
      result({
        sites: [
          {
            id: docId,
            name: "Acme Docs",
            slug: "agent-docs",
            organization: "Org agent-docs",
            url: "http://agent-docs.docs.localhost:3003",
          },
        ],
      }),
    );
  });

  it("writes, reads, deletes and discards drafts as the token's user", async () => {
    const { browser, docId } = await siteOwner("agent-drafts@mailinator.com", "agent-drafts");
    const { agent } = await connectAgent(browser);
    const path = "content/guides/setup.mdx";

    expect(
      await agent.callTool({
        name: "write_file",
        arguments: { docId, path, content: "# Setup\n" },
      }),
    ).toEqual(result({ path, status: "added", conflict: false }));
    expect(await agent.callTool({ name: "read_file", arguments: { docId, path } })).toEqual({
      content: [{ type: "text", text: "# Setup\n" }],
    });
    expect(await agent.callTool({ name: "list_files", arguments: { docId } })).toEqual(
      result({
        files: [
          { path: "content/guides/setup.mdx", status: "added", conflict: false },
          { path: "content/index.mdx", status: "added", conflict: false },
          { path: "docs.config.json", status: "added", conflict: false },
        ],
      }),
    );

    expect(await agent.callTool({ name: "delete_file", arguments: { docId, path } })).toEqual(
      result({ path, deleted: true }),
    );
    expect(await agent.callTool({ name: "read_file", arguments: { docId, path } })).toEqual(
      toolError("No file at content/guides/setup.mdx."),
    );
    expect(await agent.callTool({ name: "delete_file", arguments: { docId, path } })).toEqual(
      toolError("No file at content/guides/setup.mdx."),
    );
    expect(
      await agent.callTool({
        name: "discard_draft",
        arguments: { docId, path: "docs.config.json" },
      }),
    ).toEqual(result({ path: "docs.config.json", discarded: true }));
    expect(
      await agent.callTool({
        name: "discard_draft",
        arguments: { docId, path: "docs.config.json" },
      }),
    ).toEqual(toolError("docs.config.json has no draft."));

    // The browser sees the agent's edits as the same user's drafts.
    const { body } = await browser.rpc("docs/status", { docId });
    expect((body.json as { drafts: unknown[] }).drafts).toEqual([
      {
        path: "content/index.mdx",
        op: "put",
        conflict: false,
        updatedAt: JAN_1.getTime(),
        updatedBy: "shiru",
      },
    ]);
  });

  it("hides sites of organizations the user is not in", async () => {
    const owner = await siteOwner("agent-private@mailinator.com", "agent-private");
    const { browser } = await siteOwner("agent-outsider@mailinator.com", "agent-outsider");
    const { agent } = await connectAgent(browser);
    const docId = owner.docId;
    const path = "content/index.mdx";

    const calls = await Promise.all([
      agent.callTool({ name: "list_files", arguments: { docId } }),
      agent.callTool({ name: "read_file", arguments: { docId, path } }),
      agent.callTool({ name: "write_file", arguments: { docId, path, content: "stolen" } }),
      agent.callTool({ name: "delete_file", arguments: { docId, path } }),
      agent.callTool({ name: "discard_draft", arguments: { docId, path } }),
      agent.callTool({ name: "publish", arguments: { docId } }),
      agent.callTool({ name: "get_status", arguments: { docId } }),
    ]);
    expect(calls).toEqual(Array.from({ length: 7 }, () => toolError("Site not found")));
  });

  it("refuses write tools to a token granted only docs:read", async () => {
    const { browser, docId } = await siteOwner("agent-reader@mailinator.com", "agent-reader");
    const { agent, state } = await connectAgent(browser, "docs:read offline_access");

    expect(state.tokens?.scope).toBe("docs:read offline_access");
    expect(
      await agent.callTool({ name: "read_file", arguments: { docId, path: "docs.config.json" } }),
    ).toEqual({
      content: [{ type: "text", text: '{\n  "version": 1,\n  "name": "Acme Docs"\n}\n' }],
    });

    const write = await callApp(MCP_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${state.tokens!.access_token}`,
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "write_file", arguments: { docId, path: "a.mdx", content: "x" } },
      }),
    });
    expect(write.status).toBe(403);
    expect(write.headers.get("www-authenticate")).toBe(
      'Bearer error="insufficient_scope", error_description="Insufficient scope", scope="docs:write", resource_metadata="http://localhost:3000/.well-known/oauth-protected-resource/mcp"',
    );
  });

  it("refuses write tools once the organization's trial has ended", async () => {
    const { browser, docId } = await siteOwner("agent-expired@mailinator.com", "agent-expired");
    vi.setSystemTime(new Date("2026-03-01T00:00:00.000Z"));
    await browser.post("/auth/sign-in/email", {
      email: "agent-expired@mailinator.com",
      password: "password123",
    });
    const { agent } = await connectAgent(browser);

    expect(
      await agent.callTool({
        name: "write_file",
        arguments: { docId, path: "content/index.mdx", content: "# Late\n" },
      }),
    ).toEqual(
      toolError(
        "Payment required (trial_expired). An active subscription is required to edit this site. Manage billing at http://localhost:3001/settings/billing.",
      ),
    );
    expect(await agent.callTool({ name: "get_status", arguments: { docId } })).toEqual(
      result({
        headSha: null,
        live: { state: "idle", deployedSha: null, buildingSha: null, error: null },
        drafts: [
          { path: "content/index.mdx", op: "put", conflict: false },
          { path: "docs.config.json", op: "put", conflict: false },
        ],
      }),
    );
  });

  it("publishes the site and reports the build it started", async () => {
    const { browser, docId } = await siteOwner("agent-publish@mailinator.com", "agent-publish");
    const head = await pushFirstCommit(docId, { "docs/content/index.mdx": "# Home\n" });
    const { agent } = await connectAgent(browser);

    expect(await agent.callTool({ name: "publish", arguments: { docId } })).toEqual(
      result({ kind: "unchanged", sha: head, skipped: [] }),
    );
    expect(await agent.callTool({ name: "get_status", arguments: { docId } })).toEqual(
      result({
        headSha: head,
        live: { state: "building", deployedSha: null, buildingSha: head, error: null },
        drafts: [],
      }),
    );
  });
});
