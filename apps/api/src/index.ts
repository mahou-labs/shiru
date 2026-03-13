import { Hono } from "hono";
import { db } from "./utils/db";
import { users } from "./schema/auth";
import { createContext } from "./utils/context";
import { RPCHandler } from "@orpc/server/fetch";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";
import { appRouter } from "./routers";
import { cors } from "hono/cors";
import { env } from "cloudflare:workers";
import { logger } from "hono/logger";
import { auth } from "./utils/auth";

export type Env = { Bindings: CloudflareBindings };
const app = new Hono<Env>();
const handler = new RPCHandler(appRouter, {
  plugins: [new ResponseHeadersPlugin()],
});

app.use(
  "/*",
  cors({
    origin: [env.DASHBOARD_URL, env.SITE_URL],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "User-Agent"],
    credentials: true,
  }),
);
app.use(logger());

app.get("/", async (c) => {
  const data = await db.select().from(users);
  return c.json(data);
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  });
});

app.use("/auth/*", (c) => auth.handler(c.req.raw));

app.use("/rpc/*", async (c, next) => {
  const context = await createContext(c);
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context,
  });

  if (matched) {
    return c.newResponse(response.body as ReadableStream | null, response);
  }

  await next();
});

export default app;
