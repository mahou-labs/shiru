import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { env } from "cloudflare:workers";
import { lt } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { devRoute } from "./builder/dev-route";
import type { Doc } from "./docs/doc";
import { appRouter } from "./routers";
import { previews } from "./schema/docs";
import { auth } from "./utils/auth";
import { createContext } from "./utils/context";
import { db } from "./utils/db";
import { captureException } from "./utils/posthog";
import { rateLimit } from "./utils/rate-limit";

export const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: [env.DASHBOARD_URL, env.SITE_URL],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(rateLimit);

app.onError((error, c) => {
  captureException(error);
  return c.text("Internal Server Error", 500);
});

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));
app.route("/dev", devRoute);

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new ResponseHeadersPlugin(),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error, { context }) => {
      captureException(error, context.auth?.user.id);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  plugins: [new ResponseHeadersPlugin()],
  interceptors: [
    onError((error, { context }) => {
      captureException(error, context.auth?.user.id);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => {
  return c.text("OK");
});

const PREVIEW_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Daily: deletes the preview Workers nobody requested for 30 days. */
export async function scheduled(controller: Pick<ScheduledController, "scheduledTime">) {
  const cutoff = controller.scheduledTime - PREVIEW_TTL_MS;
  const stale = await db
    .select()
    .from(previews)
    .where(lt(previews.requestedAt, new Date(cutoff)));
  const docObjects = env.DOCS as DurableObjectNamespace<Doc>;
  const results = await Promise.allSettled(
    stale.map((row) => docObjects.getByName(row.docId).retire(row.label, cutoff)),
  );
  results.forEach((result, index) => {
    if (result.status === "fulfilled") return;
    const { docId, label } = stale[index]!;
    console.error(`could not retire the ${label} preview of ${docId}`, result.reason);
  });
}

export { Builder } from "./builder/builder";
export { PublishWorkflow } from "./docs/publish-workflow";
export { Doc } from "./docs/doc";

export default { fetch: app.fetch, scheduled } satisfies ExportedHandler<Env>;
