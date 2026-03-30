import { defineMiddleware } from "astro:middleware";
import { env, waitUntil } from "cloudflare:workers";

import { ISRCache } from "./utils/isr-cache";
import { resolveTenant } from "./utils/tenant-resolver";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com",
} as const;

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context;

  // Only apply ISR to GET requests for HTML pages
  if (request.method !== "GET") return next();

  // Skip assets and API routes
  if (
    url.pathname.startsWith("/_astro/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.match(/\.(js|css|png|jpg|svg|ico|woff|woff2)$/)
  ) {
    return next();
  }

  // Skip ISR if KV is not available
  const kv = env.KV;
  if (!kv) return next();

  const hostname = request.headers.get("host") ?? url.hostname;
  const tenant = (await resolveTenant(request, kv)) || "shiru";
  if (!tenant) {
    return new Response("Site not found", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Store tenant info for the page route
  (context.locals as Record<string, unknown>).tenant = tenant;

  const cache = new ISRCache(env.KV);
  const cached = await cache.get(hostname, url.pathname);

  if (cached && cached.version === tenant.activeVersion) {
    // Fresh cache hit — return immediately
    return new Response(cached.html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Cache-Status": "HIT",
        ...SECURITY_HEADERS,
      },
    });
  }

  if (cached) {
    // Stale (version mismatch) — serve stale, regenerate in background
    waitUntil(
      (async () => {
        const freshResponse = await next();
        const freshHtml = await freshResponse.text();
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

  // Cache miss — SSR render, then cache
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
});
