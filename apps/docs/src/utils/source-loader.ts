export interface DocsManifest {
  version: number;
  commitSha: string;
  fileCount: number;
  sidebar: Array<{
    label: string;
    items: Array<{ title: string; slug: string; order?: number }>;
  }>;
  files: Array<{ path: string; size: number }>;
}

/** Fetches the docs build manifest for a given site version from R2. Contains sidebar structure, file list, and commit metadata. */
export async function loadManifest(
  r2: R2Bucket,
  siteId: string,
  version: number,
): Promise<DocsManifest | null> {
  const key = `sources/${siteId}/v${version}/manifest.json`;
  const obj = await r2.get(key);
  if (!obj) return null;
  return obj.json() as Promise<DocsManifest>;
}

/** Loads the raw MDX/MD source for a given page slug from R2, trying multiple path conventions (.mdx, .md, index variants) until one matches. */
export async function loadMdxSource(
  r2: R2Bucket,
  siteId: string,
  version: number,
  slug: string,
): Promise<string | null> {
  // Special case: empty slug = index
  const attempts =
    !slug || slug === ""
      ? [
          `sources/${siteId}/v${version}/content/index.md`,
          `sources/${siteId}/v${version}/content/index.mdx`,
          `sources/${siteId}/v${version}/content/${slug}.mdx`,
          `sources/${siteId}/v${version}/content/${slug}/index.mdx`,
          `sources/${siteId}/v${version}/content/${slug}.md`,
          `sources/${siteId}/v${version}/content/${slug}/index.md`,
        ]
      : [
          `sources/${siteId}/v${version}/content/${slug}.mdx`,
          `sources/${siteId}/v${version}/content/${slug}/index.mdx`,
          `sources/${siteId}/v${version}/content/${slug}.md`,
          `sources/${siteId}/v${version}/content/${slug}/index.md`,
        ];

  for (const key of attempts) {
    const obj = await r2.get(key);
    if (obj) return obj.text();
  }

  return null;
}
