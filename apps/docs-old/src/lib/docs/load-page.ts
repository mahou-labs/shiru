import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

import { cacheableHtmlHeaders } from "@/lib/content/cache";
import { createCloudflareDocsStorage } from "@/lib/content/storage";
import { resolveSite } from "@/lib/sites/resolve-site";

export const loadDocsPage = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const request = new Request(`https://docs.internal/docs/${slug}`);
    const { siteId } = resolveSite(request, env);
    const storage = createCloudflareDocsStorage(env);
    const siteVersion = await storage.getCurrentVersion(siteId);

    if (!siteVersion) {
      throw new Response("Document not found", { status: 404 });
    }

    const manifest = await storage.getManifest(siteId, siteVersion);
    const page = manifest?.pages[slug];

    if (!manifest || !page) {
      throw new Response("Document not found", { status: 404 });
    }

    const artifact = await storage.getArtifact(siteId, page.contentHash);

    if (!artifact) {
      throw new Response("Document artifact not found", { status: 500 });
    }

    cacheableHtmlHeaders({ siteId, docId: page.id, siteVersion });

    return { manifest, artifact };
  });