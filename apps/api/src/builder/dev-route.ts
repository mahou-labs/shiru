import { env, exports } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

import { docs } from "../schema/docs";
import { parseWorkerName, type TargetLabel } from "../docs/names";
import { contentType, serveAsset } from "../docs/preview";
import type { Doc } from "../docs/doc";
import { db } from "../utils/db";
import type { Builder } from "./builder";
import type { SourceFile } from "./protocol";

/**
 * Development only. `/dev/builder` lets scripts/verify-builder.ts drive a Builder directly, and
 * `/dev/docs/<worker name>/` serves a target's build out of its Builder container, since there is
 * no local Workers for Platforms. The dispatch Worker forwards `<slug>.docs.localhost:3003` and
 * `<label>--<slug>.preview.docs.localhost:3003` here.
 */
export const devRoute = new Hono();

// Builder comes from this Worker's own exports and Doc from a binding; publish-workflow.ts says why
// both are cast.
const builder = (name: string) =>
  (exports.Builder as unknown as DurableObjectNamespace<Builder>).getByName(name);
const docObject = (id: string) => (env.DOCS as DurableObjectNamespace<Doc>).getByName(id);

devRoute.use(async (c, next) => {
  if (env.ENVIRONMENT !== "development") return c.notFound();
  await next();
});

devRoute.post("/builder/:name/reset", async (c) => {
  // JSON carries no bytes, so each file comes base64-encoded.
  const files = await c.req.json<{ path: string; base64: string }[]>();
  const decoded: SourceFile[] = files.map(({ path, base64 }) => ({
    path,
    content: Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)),
  }));
  return c.json(await builder(c.req.param("name")).reset(decoded));
});

devRoute.post("/builder/:name/build", async (c) => {
  const input = await c.req.json<{ docUrl: string; docsRoot: string }>();
  return c.json(await builder(c.req.param("name")).build(input));
});

devRoute.get("/builder/:name/asset", async (c) => {
  const bytes = await builder(c.req.param("name")).readAsset(c.req.query("path")!);
  return new Response(bytes);
});

devRoute.get("/docs/:name", (c) => c.redirect(`${c.req.param("name")}/`, 307));

devRoute.get("/docs/:name/*", async (c) => {
  const name = c.req.param("name");
  const parsed = parseWorkerName(name);
  const [doc] = parsed
    ? await db.select({ id: docs.id }).from(docs).where(eq(docs.slug, parsed.slug))
    : [];
  if (!parsed || !doc) return c.text("No site at this address", 404);

  const path = new URL(c.req.url).pathname.slice(`/dev/docs/${name}`.length);
  const container = builder(`build-${doc.id}-${parsed.target}`);
  let served;
  try {
    served = await serveAsset(path, async (file) => {
      try {
        return await container.readAsset(file);
      } catch (error) {
        // A missing file is a normal miss; a stopped container is not.
        if (String(error).includes("not running")) throw error;
        return null;
      }
    });
  } catch {
    return c.text(await rebuild(doc.id, parsed.target), 503);
  }

  if (served.kind === "redirect") {
    return new Response(null, { status: 307, headers: { location: served.location } });
  }
  if (served.kind === "not_found") return c.text("Not found", 404);
  return new Response(served.body, {
    status: served.status,
    headers: { "content-type": contentType(served.path) },
  });
});

// Containers stop when idle, taking the build with them. Rebuild what was deployed.
async function rebuild(docId: string, target: TargetLabel) {
  const doc = docObject(docId);
  const state = (await doc.status()).targets[target];
  if (state?.kind === "building") return "This site is building. Reload in a few seconds.";
  if (!state?.deployed) return "Nothing has been built here yet.";
  await doc.rebuild(target);
  return "The build container for this site had stopped, so it is rebuilding. Reload in a few seconds.";
}
