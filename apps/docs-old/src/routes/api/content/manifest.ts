import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

import { createCloudflareDocsStorage } from "@/lib/content/storage";
import { resolveSite } from "@/lib/sites/resolve-site";

export const Route = createFileRoute("/api/content/manifest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const resolvedSite = resolveSite(request, env);
        const siteId = url.searchParams.get("siteId") || resolvedSite.siteId;
        const storage = createCloudflareDocsStorage(env);
        const siteVersion = await storage.getCurrentVersion(siteId);

        if (!siteVersion) {
          return json(
            { error: "Manifest not found" },
            { status: 404, headers: { "Cache-Control": "public, max-age=30" } },
          );
        }

        const manifest = await storage.getManifest(siteId, siteVersion);

        if (!manifest) {
          return json(
            { error: "Manifest not found" },
            { status: 404, headers: { "Cache-Control": "public, max-age=30" } },
          );
        }

        return json(manifest, {
          headers: {
            "Cache-Control": "public, max-age=30",
            "CDN-Cache-Control": "max-age=300",
          },
        });
      },
    },
  },
});
