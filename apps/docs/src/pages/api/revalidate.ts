import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as {
    secret: string;
    orgSlug: string;
    paths?: string[];
  };

  // Authenticate
  const expectedSecret = env.REVALIDATION_SECRET;
  if (!expectedSecret || body.secret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.orgSlug) {
    return new Response(JSON.stringify({ error: "Missing orgSlug" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Invalidation is implicit via version-based cache check.
  // This endpoint exists for explicit cache purge if needed.
  const kv = env.KV;
  let invalidated = 0;

  if (body.paths && body.paths.length > 0) {
    const hostname = `${body.orgSlug}.shiru.sh`;
    await Promise.all(
      body.paths.map(async (path) => {
        await kv.delete(`html:${hostname}:${path}`);
        invalidated++;
      }),
    );
  } else {
    // List and delete all cached pages for this org
    const hostname = `${body.orgSlug}.shiru.sh`;
    const prefix = `html:${hostname}:`;
    let cursor: string | undefined;
    do {
      const result = await kv.list({ prefix, cursor });
      await Promise.all(result.keys.map((key) => kv.delete(key.name)));
      invalidated += result.keys.length;
      cursor = result.list_complete ? undefined : result.cursor;
    } while (cursor);
  }

  return new Response(JSON.stringify({ success: true, invalidated }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
