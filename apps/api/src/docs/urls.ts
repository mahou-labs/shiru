import { env } from "cloudflare:workers";

import type { DocsDomains, TargetLabel } from "./names";

/** The domains docs and their previews are served under. */
export function docsDomains(): DocsDomains {
  return { docs: env.DOCS_DOMAIN, preview: `preview.${env.DOCS_DOMAIN}` };
}

/**
 * Where a preview target of a doc is served, for the dashboard's links and for the build's
 * canonical URLs. The live target's URL is `docUrl` in domains/domains.ts. In development the
 * dispatch Worker serves `*.docs.localhost` on port 3003.
 */
export function previewUrl(slug: string, label: TargetLabel) {
  const host = `${label}--${slug}.${docsDomains().preview}`;
  return env.ENVIRONMENT === "development" ? `http://${host}:3003` : `https://${host}`;
}
