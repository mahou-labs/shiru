import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { env as cloudflareEnv } from "cloudflare:workers";
import { z } from "zod";

import { createCloudflareDocsStorage } from "@/lib/content/storage";

const publishSchema = z.object({
  siteId: z.string().min(1),
  slug: z.string().min(1),
  mdx: z.string().min(1),
});

type PublishRouteEnv = Env & {
  DOCS_PUBLISH_TOKEN?: string;
};

export const Route = createFileRoute("/api/content/publish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const env = cloudflareEnv as PublishRouteEnv;
        const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");

        if (!env.DOCS_PUBLISH_TOKEN || token !== env.DOCS_PUBLISH_TOKEN) {
          return json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
          );
        }

        const parsed = publishSchema.safeParse(await request.json());

        if (!parsed.success) {
          return json(
            { error: "Invalid publish input", issues: parsed.error.issues },
            { status: 400, headers: { "Cache-Control": "no-store" } },
          );
        }

        const storage = createCloudflareDocsStorage(env);
        const result = await storage.publishDocument(parsed.data);

        return json(result, {
          headers: {
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
