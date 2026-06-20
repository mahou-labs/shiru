const mdxSuffix = /\.mdx?$/;
const repeatedSlashes = /\/+/g;

export function normalizeSlug(input: string) {
  const slug = input
    .trim()
    .replace(repeatedSlashes, "/")
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .replace(mdxSuffix, "");

  if (!slug || slug.includes("..") || slug.startsWith(".")) {
    throw new Error("Invalid document slug");
  }

  return slug;
}

export function rawMdxKey(siteId: string, slug: string) {
  return `sites/${siteId}/docs/${normalizeSlug(slug)}.mdx`;
}

export function compiledArtifactKey(siteId: string, contentHash: string) {
  return `compiled/${siteId}/${contentHash}.json`;
}

export function manifestKey(siteId: string, siteVersion: string) {
  return `manifest:${siteId}:${siteVersion}`;
}

export function siteVersionKey(siteId: string) {
  return `site-version:${siteId}`;
}
