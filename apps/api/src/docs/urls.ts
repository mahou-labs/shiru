import { env } from "cloudflare:workers";

import { type DocsDomains, LIVE, type TargetLabel } from "./names";

/** The domains docs and their previews are served under. */
export function docsDomains(): DocsDomains {
  return { docs: env.DOCS_DOMAIN, preview: `preview.${env.DOCS_DOMAIN}` };
}

/**
 * Where a target of a doc is served, for the dashboard's links and for the build's canonical
 * URLs. In development the dispatch Worker serves `*.docs.localhost` on port 3003.
 */
export function targetUrl(slug: string, target: TargetLabel) {
  const domains = docsDomains();
  const host =
    target === LIVE ? `${slug}.${domains.docs}` : `${target}--${slug}.${domains.preview}`;
  return env.ENVIRONMENT === "development" ? `http://${host}:3003` : `https://${host}`;
}
