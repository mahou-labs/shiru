export interface ResolvedSite {
  siteId: string;
  host: string;
}

export function resolveSite(request: Request, env: Env): ResolvedSite {
  const url = new URL(request.url);
  const configuredSiteId = env.DEFAULT_SITE_ID || "local";

  return {
    siteId: configuredSiteId,
    host: url.host,
  };
}
