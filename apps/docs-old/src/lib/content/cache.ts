import { normalizeSlug } from "./slug";

const htmlCache = caches as CacheStorage & { readonly default: Cache };

export function getHtmlCacheKey(args: { siteId: string; slug: string; siteVersion: string }) {
  const slugPath = normalizeSlug(args.slug);
  return new Request(`https://docs-cache.internal/${args.siteId}/${slugPath}?v=${args.siteVersion}`, {
    method: "GET",
  });
}

export function cacheableHtmlHeaders(args: { siteId: string; docId: string; siteVersion: string }) {
  return {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=86400",
    "CDN-Cache-Control": "max-age=31536000",
    "Cache-Tag": [`site:${args.siteId}`, `doc:${args.docId}`, `version:${args.siteVersion}`].join(","),
  };
}

export async function readCachedHtml(cacheKey: Request) {
  return htmlCache.default.match(cacheKey);
}

export async function writeCachedHtml(cacheKey: Request, response: Response) {
  if (response.status !== 200 || response.headers.has("Set-Cookie")) {
    return;
  }

  await htmlCache.default.put(cacheKey, response.clone());
}
