import {
  LIVE,
  parseHostname,
  workerName,
  type DocsDomains,
  type DocSlug,
} from "../../api/src/docs/names";
import { mcpHandler, parseLlmsFull } from "./mcp";

export type Route = { kind: "dispatch"; slug: DocSlug; workerName: string } | { kind: "notFound" };

// Previews wait on the auth handoff and custom hostnames on Cloudflare for SaaS; until then
// neither is served, so a preview is never reachable without sign-in.
export function route(hostname: string, domains: DocsDomains): Route {
  const parsed = parseHostname(hostname, domains);
  if (parsed.kind !== "doc") return { kind: "notFound" };
  return { kind: "dispatch", slug: parsed.slug, workerName: workerName(parsed.slug, LIVE) };
}

// Production forwards to the doc's Worker in the dispatch namespace. Development has no
// namespace, so the API Worker serves the doc's live build instead.
function fetchDoc(target: Extract<Route, { kind: "dispatch" }>, request: Request, env: Env) {
  if (env.DISPATCHER) return env.DISPATCHER.get(target.workerName).fetch(request);

  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  // The docs hostname means nothing to the API's dev server.
  headers.delete("host");
  return fetch(`${env.DEV_DOCS_ORIGIN}/dev/docs/${target.slug}${url.pathname}${url.search}`, {
    method: request.method,
    headers,
    redirect: "manual",
  });
}

const notFound = () => new Response("No docs site here", { status: 404 });

// Every request reads llms-full.txt first, so a slug with no site answers 404 like any other path
// and the server can name the site before a tool runs.
async function serveMcp(target: Extract<Route, { kind: "dispatch" }>, request: Request, env: Env) {
  const llms = await fetchDoc(target, new Request(new URL("/llms-full.txt", request.url)), env);
  if (llms.status === 404) return notFound();
  const site = llms.ok ? parseLlmsFull(await llms.text()) : null;
  return mcpHandler(site).fetch(request);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const target = route(url.hostname, {
      docs: env.DOCS_DOMAIN,
      preview: env.PREVIEW_DOMAIN,
    });
    if (target.kind === "notFound") return notFound();

    try {
      if (url.pathname === "/mcp") return await serveMcp(target, request, env);
      return await fetchDoc(target, request, env);
    } catch (error) {
      // A slug with no deployed Worker yet. Documented message for a missing namespace script.
      if (error instanceof Error && error.message.startsWith("Worker not found")) return notFound();
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;
