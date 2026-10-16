import {
  DocSlug,
  hostKey,
  LIVE,
  parseHostname,
  redirectKey,
  workerName,
  type DocsDomains,
} from "../../api/src/docs/names";

export type Route =
  | { kind: "dispatch"; slug: DocSlug; workerName: string }
  | { kind: "redirect"; location: string }
  | { kind: "notFound" };

/** Reads a key from the DOMAINS namespace that apps/api writes. */
export type Lookup = (key: string) => Promise<string | null>;

const notFoundRoute: Route = { kind: "notFound" };
const dispatchRoute = (slug: DocSlug): Route => ({
  kind: "dispatch",
  slug,
  workerName: workerName(slug, LIVE),
});

/**
 * Where a request goes. A doc with an active custom domain redirects there, and a custom domain
 * serves its doc's live Worker. Previews wait on the auth handoff, so none is served yet and a
 * preview is never reachable without sign-in.
 */
export async function route(url: URL, domains: DocsDomains, lookup: Lookup): Promise<Route> {
  const parsed = parseHostname(url.hostname, domains);
  switch (parsed.kind) {
    case "doc": {
      const custom = await lookup(redirectKey(parsed.slug));
      if (custom === null) return dispatchRoute(parsed.slug);
      return { kind: "redirect", location: `https://${custom}${url.pathname}${url.search}` };
    }
    case "custom": {
      const slug = DocSlug.safeParse(await lookup(hostKey(parsed.hostname)));
      return slug.success ? dispatchRoute(slug.data) : notFoundRoute;
    }
    case "preview":
    case "invalid":
      return notFoundRoute;
  }
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

// Every asset request passes through here, so lookups may be up to a minute stale.
const LOOKUP_CACHE_TTL = 60;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const target = await route(
      new URL(request.url),
      { docs: env.DOCS_DOMAIN, preview: env.PREVIEW_DOMAIN },
      (key) => env.DOMAINS.get(key, { cacheTtl: LOOKUP_CACHE_TTL }),
    );
    if (target.kind === "notFound") return notFound();
    if (target.kind === "redirect") {
      // Cached for an hour only, so removing the domain does not leave browsers redirecting.
      return new Response(null, {
        status: 301,
        headers: { location: target.location, "cache-control": "max-age=3600" },
      });
    }

    try {
      return await fetchDoc(target, request, env);
    } catch (error) {
      // A slug with no deployed Worker yet. Documented message for a missing namespace script.
      if (error instanceof Error && error.message.startsWith("Worker not found")) return notFound();
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;
