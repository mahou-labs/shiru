globalThis.process ??= {};
globalThis.process.env ??= {};
import { env, waitUntil } from "cloudflare:workers";

import { t as sequence, v as defineMiddleware } from "./chunks/sequence_BBfB_bZB.mjs";
//#region src/utils/isr-cache.ts
const ISRCache = class {
  constructor(kv) {
    this.kv = kv;
  }
  /** Retrieves a cached HTML page from KV by hostname + path. Returns null on miss or if metadata is missing. */
  async get(hostname, path) {
    try {
      const key = `html:${hostname}:${path}`;
      const result = await this.kv.getWithMetadata(key);
      if (!result.value || !result.metadata) return null;
      return {
        html: result.value,
        version: result.metadata.version,
        renderedAt: result.metadata.renderedAt,
      };
    } catch {
      return null;
    }
  }
  /** Stores a rendered HTML page in KV with version and timestamp metadata. Expires after 7 days. */
  async set(hostname, path, html, version) {
    const key = `html:${hostname}:${path}`;
    await this.kv.put(key, html, {
      metadata: {
        version,
        renderedAt: Date.now(),
      },
      expirationTtl: 604800,
    });
  }
};
//#endregion
//#region src/utils/tenant-resolver.ts
const DOCS_HOST_SUFFIX = ".shiru.sh";
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
/** Extracts the org slug from a docs hostname (e.g. "acme.shiru.sh" → "acme"). Returns null if the hostname doesn't match the expected pattern. */
function parseDocsHostname(hostname) {
  const host = hostname.split(":")[0]?.toLowerCase() ?? "";
  if (host.endsWith(DOCS_HOST_SUFFIX)) {
    const slug = host.slice(0, -9);
    if (slug && SLUG_RE.test(slug)) return slug;
  }
  return null;
}
/** Resolves the docs site config for the current request by parsing the hostname and looking up the org's site config in KV. */
async function resolveTenant(request, kv) {
  const slug = parseDocsHostname(request.headers.get("host") ?? new URL(request.url).hostname);
  if (!slug) return null;
  const config = await kv.get(`site:${slug}`, "json");
  if (!config || !config.activeVersion) return null;
  return {
    ...config,
    orgSlug: slug,
  };
}
//#endregion
//#region src/middleware.ts
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com",
};
//#endregion
//#region \0virtual:astro:middleware
const onRequest = sequence(
  defineMiddleware(async (context, next) => {
    const { request, url } = context;
    if (request.method !== "GET") return next();
    if (
      url.pathname.startsWith("/_astro/") ||
      url.pathname.startsWith("/api/") ||
      url.pathname.match(/\.(js|css|png|jpg|svg|ico|woff|woff2)$/)
    )
      return next();
    const kv = env.KV;
    if (!kv) return next();
    const hostname = request.headers.get("host") ?? url.hostname;
    const tenant = (await resolveTenant(request, kv)) || "shiru";
    if (!tenant)
      return new Response("Site not found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    context.locals.tenant = tenant;
    const cache = new ISRCache(env.KV);
    const cached = await cache.get(hostname, url.pathname);
    if (cached && cached.version === tenant.activeVersion)
      return new Response(cached.html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Cache-Status": "HIT",
          ...SECURITY_HEADERS,
        },
      });
    if (cached) {
      waitUntil(
        (async () => {
          const freshHtml = await (await next()).text();
          await cache.set(hostname, url.pathname, freshHtml, tenant.activeVersion);
        })(),
      );
      return new Response(cached.html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Cache-Status": "STALE",
          ...SECURITY_HEADERS,
        },
      });
    }
    const response = await next();
    if (response.status === 200 && response.headers.get("content-type")?.includes("text/html")) {
      const html = await response.text();
      waitUntil(cache.set(hostname, url.pathname, html, tenant.activeVersion));
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Cache-Status": "MISS",
          ...SECURITY_HEADERS,
        },
      });
    }
    return response;
  }),
);
//#endregion
export { onRequest };
