import { createServer } from "node:http";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const email = process.env.VERIFY_EMAIL;
const password = process.env.VERIFY_PASSWORD;
if (!email || !password) throw new Error("set VERIFY_EMAIL and VERIFY_PASSWORD to a verified user");
const API = process.env.VERIFY_API_URL ?? "http://localhost:3000";
const DASHBOARD = process.env.VERIFY_DASHBOARD_URL ?? "http://localhost:3001";

const api = createRequire(new URL("../../../../apps/api/package.json", import.meta.url));
const { Client, StreamableHTTPClientTransport } = await import(
  pathToFileURL(api.resolve("@modelcontextprotocol/client")).href
);

// The agent's loopback redirect, the way `claude mcp add` listens for the authorization code.
const callback = createServer();
await new Promise((ok) => callback.listen(0, "localhost", ok));
const redirectUrl = `http://localhost:${callback.address().port}/callback`;
const code = new Promise((ok) =>
  callback.on("request", (request, response) => {
    response.end("Agent connected. You can close this tab.");
    ok(new URL(request.url, redirectUrl));
  }),
);

const state = {};
const provider = {
  redirectUrl,
  clientMetadata: {
    client_name: "Verify Agent",
    redirect_uris: [redirectUrl],
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
  codeVerifier: () => state.verifier,
  saveDiscoveryState: (discovery) => void (state.discovery = discovery),
  discoveryState: () => state.discovery,
};
const transport = () =>
  new StreamableHTTPClientTransport(new URL(`${API}/mcp`), { authProvider: provider });

export default async (page) => {
  try {
    await new Client({ name: "verify", version: "1.0.0" }).connect(transport());
    throw new Error("/mcp accepted an agent without a token");
  } catch (error) {
    if (!state.authorizationUrl) throw error;
  }
  page.log("the agent registered itself and got an authorization URL");

  await page.goto(state.authorizationUrl.href);
  await page.waitForUrl(`${DASHBOARD}/auth/sign-in?`);
  page.log("authorizing while signed out opens the dashboard's sign-in page");
  await page.screenshot("sign-in.png");

  await page.fill("[name=email]", email);
  await page.fill("[name=password]", password);
  await page.click("form button[type=submit]");
  await page.waitForUrl(`${DASHBOARD}/oauth/consent?`);
  await page.waitForText("Verify Agent");
  page.log("signing in continues to the consent page for the agent");
  await page.screenshot("consent.png");

  await page.clickButton("Allow");
  const returned = await code;
  callback.close();
  if (!returned.searchParams.get("code")) throw new Error(`no code in ${returned.search}`);
  await page.waitForText("Agent connected");
  page.log("Allow sends the browser back to the agent's redirect with a code");
  await page.screenshot("agent-connected.png");

  await transport().finishAuth(returned.searchParams);
  if (state.tokens?.scope !== "docs:read docs:write offline_access") {
    throw new Error(`token scope is ${state.tokens?.scope}`);
  }
  const agent = new Client({ name: "verify", version: "1.0.0" });
  await agent.connect(transport());
  const { structuredContent } = await agent.callTool({ name: "list_sites", arguments: {} });
  page.log(`the agent's token works: list_sites returned ${JSON.stringify(structuredContent)}`);
  await agent.close();
};
