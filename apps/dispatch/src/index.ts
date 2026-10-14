import {
  LIVE,
  parseHostname,
  workerName,
  type DocsDomains,
  type DocSlug,
} from "../../api/src/docs/names";

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const target = route(new URL(request.url).hostname, {
      docs: env.DOCS_DOMAIN,
      preview: env.PREVIEW_DOMAIN,
    });
    if (target.kind === "notFound") return notFound();

    try {
      return await fetchDoc(target, request, env);
    } catch (error) {
      // A slug with no deployed Worker yet. Documented message for a missing namespace script.
      if (error instanceof Error && error.message.startsWith("Worker not found")) return notFound();
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;
