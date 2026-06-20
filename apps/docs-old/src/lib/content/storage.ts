import { compileMdxDocument, hashMdx } from "./compile-mdx";
import { buildManifest } from "./manifest";
import { compiledArtifactKey, manifestKey, normalizeSlug, rawMdxKey, siteVersionKey } from "./slug";
import type {
  CompiledDocArtifact,
  DocMetadata,
  DocsManifest,
  PublishDocumentInput,
  PublishDocumentResult,
} from "./types";

export interface DocsStorage {
  getCurrentVersion(siteId: string): Promise<string | null>;
  getManifest(siteId: string, siteVersion: string): Promise<DocsManifest | null>;
  getArtifact(siteId: string, contentHash: string): Promise<CompiledDocArtifact | null>;
  publishDocument(input: PublishDocumentInput): Promise<PublishDocumentResult>;
}

export function createCloudflareDocsStorage(env: Env): DocsStorage {
  return {
    async getCurrentVersion(siteId) {
      return env.DOCS_MANIFESTS.get(siteVersionKey(siteId));
    },
    async getManifest(siteId, siteVersion) {
      return env.DOCS_MANIFESTS.get<DocsManifest>(manifestKey(siteId, siteVersion), "json");
    },
    async getArtifact(siteId, contentHash) {
      const object = await env.DOCS_BUCKET.get(compiledArtifactKey(siteId, contentHash));
      if (!object) {
        return null;
      }

      return object.json<CompiledDocArtifact>();
    },
    async publishDocument(input) {
      const slug = normalizeSlug(input.slug);
      const contentHash = await hashMdx(input.mdx);
      const artifact = await compileMdxDocument({ siteId: input.siteId, slug, mdx: input.mdx });
      const docId = `${input.siteId}:${slug}`;
      const updatedAt = new Date().toISOString();
      const siteVersion = contentHash.slice(0, 16);

      await env.DOCS_BUCKET.put(rawMdxKey(input.siteId, slug), input.mdx, {
        httpMetadata: { contentType: "text/markdown; charset=utf-8" },
        customMetadata: { siteId: input.siteId, slug, contentHash },
      });

      await env.DOCS_BUCKET.put(compiledArtifactKey(input.siteId, contentHash), JSON.stringify(artifact), {
        httpMetadata: { contentType: "application/json; charset=utf-8" },
        customMetadata: { siteId: input.siteId, slug, contentHash },
      });

      await env.DOCS_DB.prepare(
        `insert into docs (id, site_id, slug, title, description, order_index, content_hash, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?)
         on conflict(id) do update set
           title = excluded.title,
           description = excluded.description,
           order_index = excluded.order_index,
           content_hash = excluded.content_hash,
           updated_at = excluded.updated_at`,
      )
        .bind(
          docId,
          input.siteId,
          slug,
          artifact.frontmatter.title,
          artifact.frontmatter.description ?? "",
          artifact.frontmatter.order ?? 100,
          contentHash,
          updatedAt,
        )
        .run();

      const docs = await loadDocsMetadata(env, input.siteId);
      const manifest = buildManifest(input.siteId, siteVersion, docs);
      await env.DOCS_MANIFESTS.put(manifestKey(input.siteId, siteVersion), JSON.stringify(manifest));
      await env.DOCS_MANIFESTS.put(siteVersionKey(input.siteId), siteVersion);

      return { siteId: input.siteId, slug, docId, siteVersion, contentHash };
    },
  };
}

async function loadDocsMetadata(env: Env, siteId: string) {
  const result = await env.DOCS_DB.prepare(
    `select id, site_id, slug, title, description, order_index, content_hash, updated_at
     from docs
     where site_id = ?
     order by order_index asc, slug asc`,
  )
    .bind(siteId)
    .all<{
      id: string;
      site_id: string;
      slug: string;
      title: string;
      description: string;
      order_index: number;
      content_hash: string;
      updated_at: string;
    }>();

  return result.results.map<DocMetadata>((row) => ({
    id: row.id,
    siteId: row.site_id,
    slug: row.slug,
    title: row.title,
    description: row.description || undefined,
    order: row.order_index,
    contentHash: row.content_hash,
    updatedAt: row.updated_at,
  }));
}
