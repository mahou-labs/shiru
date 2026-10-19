# MCP agents

A coding agent such as Claude Code connects to `http://localhost:3000/mcp` and is refused until the user authorizes it. The agent registers itself, opens the authorization URL in the user's browser, and the dashboard signs the user in if needed and asks `Allow <agent> to use your account?` on `/oauth/consent`. Allow sends the browser back to the agent's loopback redirect, and the agent trades the code for a token that works on `/mcp`. Account settings show how to connect an agent under `Connect an agent`.

## Sub-features

- `mcp-connect-agent` covers registration, the signed-out sign-in, consent, the redirect back to the agent, the token exchange and a `list_sites` call with the new token.
- `mcp-deny` sends the agent back with `error=access_denied` when the user chooses `Deny`.
- `mcp-settings` shows the `claude mcp add` command on `/settings/account`.

## How to get to it (user POV)

- Run `claude mcp add --transport http shiru http://localhost:3000/mcp`, then `/mcp` in Claude Code to authenticate. The browser opens the dashboard.
- Choose `Account` under `Settings` in the sidebar to see `Connect an agent`.

## Driving it with verify-shiru

Preconditions:

- `doctor.sh` exits 0.
- A verified user who belongs to an organization with at least one site, signed out in the browser. Pass it as `VERIFY_EMAIL` and `VERIFY_PASSWORD`.

- **Connect an agent.** Run `node .claude/skills/verify-shiru/scripts/browser.mjs .claude/skills/verify-shiru/steps/mcp-connect-agent.mjs "$(cat .verify/current)/evidence/mcp-connect-agent"`. The steps file plays the agent with the real MCP client from `apps/api` and listens on a loopback port for the redirect. It drives sign-in and `Allow` in the browser, then logs the user's sites from `list_sites`.
- **Deny.** Run the same flow by hand and `clickButton("Deny")` on the consent page. The redirect carries `error=access_denied`.
- **Settings.** Signed in, open `/settings/account` and `waitForText("Connect an agent")`.

## Gotchas

- The steps file reads `VERIFY_API_URL` and `VERIFY_DASHBOARD_URL`, which default to ports 3000 and 3001. Set them when the apps run elsewhere.
- The tables come from the `mcp_oauth` migration. A local D1 created before it answers every auth request with `no such table: oauth_resources`.
- Open the consent page only through the agent's authorization URL. The API signs its query (`sig`), and consent sends that query back. Opened by hand, the page names `An application` and Allow fails.
- `/mcp` answers a missing or invalid token with 401 and a `WWW-Authenticate` header naming `/.well-known/oauth-protected-resource/mcp`. That is the agent's cue to start this flow, not a failure.
