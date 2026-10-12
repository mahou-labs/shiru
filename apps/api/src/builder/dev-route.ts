import { env } from "cloudflare:workers";
import { Hono } from "hono";

import type { Builder } from "./builder";
import type { SourceFile } from "./protocol";

/**
 * Temporary: lets scripts/verify-builder.sh drive the Builder under `cf dev`.
 * Delete it once the PublishWorkflow calls the Builder.
 */
export const builderDevRoute = new Hono();

// The binding names this Worker by string, so cf/config cannot infer the class.
const builder = (name: string) => (env.BUILDER as DurableObjectNamespace<Builder>).getByName(name);

builderDevRoute.use(async (c, next) => {
  if (env.ENVIRONMENT !== "development") return c.notFound();
  await next();
});

builderDevRoute.post("/:name/reset", async (c) => {
  const files = await c.req.json<SourceFile[]>();
  return c.json(await builder(c.req.param("name")).reset(files));
});

builderDevRoute.post("/:name/build", async (c) => {
  const input = await c.req.json<{ siteUrl: string; docsRoot: string }>();
  return c.json(await builder(c.req.param("name")).build(input));
});

builderDevRoute.get("/:name/asset", async (c) => {
  const bytes = await builder(c.req.param("name")).readAsset(c.req.query("path")!);
  return new Response(bytes);
});
