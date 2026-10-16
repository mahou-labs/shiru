import {
  LIVE,
  parseHostname,
  workerName,
  type DocsDomains,
  type DocSlug,
  type TargetLabel,
} from "../../api/src/docs/names";
import {
  HANDOFF_PATH,
  PREVIEW_COOKIE,
  safePath,
  SESSION_TTL_MS,
  signGrant,
  verifyGrant,
} from "../../api/src/docs/preview-access";

export type Route =
  | { kind: "dispatch"; slug: DocSlug; workerName: string }
  | { kind: "preview"; slug: DocSlug; label: TargetLabel; workerName: string }
  | { kind: "notFound" };

type Served = Exclude<Route, { kind: "notFound" }>;

// Custom hostnames wait on Cloudflare for SaaS; until then they are not served.
export function route(hostname: string, domains: DocsDomains): Route {
  const parsed = parseHostname(hostname, domains);
  switch (parsed.kind) {
    case "doc":
      return { kind: "dispatch", slug: parsed.slug, workerName: workerName(parsed.slug, LIVE) };
    case "preview":
      return {
        kind: "preview",
        slug: parsed.slug,
        label: parsed.label,
        workerName: workerName(parsed.slug, parsed.label),
      };
    default:
      return { kind: "notFound" };
  }
}

// Production forwards to the target's Worker in the dispatch namespace. Development has no
// namespace, so the API Worker serves the target's build instead.
function fetchDoc(target: Served, request: Request, env: Env) {
  if (env.DISPATCHER) return env.DISPATCHER.get(target.workerName).fetch(request);

  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  // The docs hostname means nothing to the API's dev server.
  headers.delete("host");
  return fetch(`${env.API_ORIGIN}/dev/docs/${target.workerName}${url.pathname}${url.search}`, {
    method: request.method,
    headers,
    redirect: "manual",
  });
}

/**
 * A preview is only for members of the doc's organization, which the API checks. Without a
 * session cookie for this host the visitor goes to the API, which sends a member back to
 * HANDOFF_PATH with a short grant that becomes the cookie.
 */
async function fetchPreview(target: Served, request: Request, env: Env) {
  const url = new URL(request.url);
  const now = Date.now();
  const expected = { host: url.hostname, now, secret: env.PREVIEW_SECRET };

  if (url.pathname === HANDOFF_PATH) {
    const token = url.searchParams.get("token") ?? "";
    if (!(await verifyGrant(token, { ...expected, kind: "handoff" }))) {
      return new Response("This preview link has expired. Open the preview again.", {
        status: 403,
        headers: { "cache-control": "no-store" },
      });
    }
    const session = await signGrant(
      { kind: "session", host: url.hostname, exp: now + SESSION_TTL_MS },
      env.PREVIEW_SECRET,
    );
    return new Response(null, {
      status: 302,
      headers: {
        location: safePath(url.searchParams.get("path") ?? undefined),
        "set-cookie": `${PREVIEW_COOKIE}=${session}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`,
        "cache-control": "no-store",
      },
    });
  }

  const { session, others } = splitCookies(request.headers.get("cookie"));
  if (session !== undefined && (await verifyGrant(session, { ...expected, kind: "session" }))) {
    // The doc's own scripts never see the grant.
    const headers = new Headers(request.headers);
    if (others) headers.set("cookie", others);
    else headers.delete("cookie");
    const response = await fetchDoc(target, new Request(request, { headers }), env);
    const served = new Response(response.body, response);
    served.headers.set("X-Robots-Tag", "noindex");
    served.headers.set("Cache-Control", "private, no-store");
    return served;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Sign in to see this preview", { status: 401 });
  }
  const authorize = new URLSearchParams({ host: url.hostname, path: url.pathname + url.search });
  return new Response(null, {
    status: 302,
    headers: {
      location: `${env.API_ORIGIN}/preview/authorize?${authorize.toString()}`,
      "cache-control": "no-store",
    },
  });
}

function splitCookies(header: string | null) {
  let session: string | undefined;
  const others: string[] = [];
  for (const pair of header?.split(";") ?? []) {
    const cookie = pair.trim();
    if (cookie.startsWith(`${PREVIEW_COOKIE}=`)) session = cookie.slice(PREVIEW_COOKIE.length + 1);
    else if (cookie) others.push(cookie);
  }
  return { session, others: others.join("; ") };
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
      return target.kind === "preview"
        ? await fetchPreview(target, request, env)
        : await fetchDoc(target, request, env);
    } catch (error) {
      // A slug with no deployed Worker yet. Documented message for a missing namespace script.
      if (error instanceof Error && error.message.startsWith("Worker not found")) return notFound();
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;
