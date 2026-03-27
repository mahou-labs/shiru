const DOCS_HOST_SUFFIX = ".shiru.sh";
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

export interface SiteConfig {
  siteId: string;
  orgId: string;
  activeVersion: number;
  orgSlug: string;
}

/** Extracts the org slug from a docs hostname (e.g. "acme.shiru.sh" → "acme"). Returns null if the hostname doesn't match the expected pattern. */
export function parseDocsHostname(hostname: string): string | null {
  const host = hostname.split(":")[0]?.toLowerCase() ?? "";
  if (host.endsWith(DOCS_HOST_SUFFIX)) {
    const slug = host.slice(0, -DOCS_HOST_SUFFIX.length);
    if (slug && SLUG_RE.test(slug)) return slug;
  }
  return null;
}

/** Resolves the docs site config for the current request by parsing the hostname and looking up the org's site config in KV. */
export async function resolveTenant(request: Request, kv: KVNamespace): Promise<SiteConfig | null> {
  const hostname = request.headers.get("host") ?? new URL(request.url).hostname;
  const slug = parseDocsHostname(hostname);
  if (!slug) return null;

  const config = (await kv.get(`site:${slug}`, "json")) as SiteConfig | null;
  if (!config || !config.activeVersion) return null;

  return { ...config, orgSlug: slug };
}
