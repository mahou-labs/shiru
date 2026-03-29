globalThis.process ??= {};
globalThis.process.env ??= {};
import { env } from "cloudflare:workers";

import { n as __exportAll } from "./chunk_B-gkxaTK.mjs";
//#region src/pages/api/revalidate.ts
const revalidate_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
const POST = async ({ request }) => {
  const body = await request.json();
  const expectedSecret = env.REVALIDATION_SECRET;
  if (!expectedSecret || body.secret !== expectedSecret)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  if (!body.orgSlug)
    return new Response(JSON.stringify({ error: "Missing orgSlug" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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
    const prefix = `html:${`${body.orgSlug}.shiru.sh`}:`;
    let cursor;
    do {
      const result = await kv.list({
        prefix,
        cursor,
      });
      await Promise.all(result.keys.map((key) => kv.delete(key.name)));
      invalidated += result.keys.length;
      cursor = result.list_complete ? void 0 : result.cursor;
    } while (cursor);
  }
  return new Response(
    JSON.stringify({
      success: true,
      invalidated,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/revalidate@_@ts
const page = () => revalidate_exports;
//#endregion
export { page };
