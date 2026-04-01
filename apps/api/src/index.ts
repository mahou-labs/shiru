import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { PostHog } from "posthog-node";

import { githubRoutes } from "./github-routes";
import { appRouter } from "./routers";
import { auth } from "./utils/auth";
import { createContext } from "./utils/context";
import { log } from "./utils/logger";

export { PublishDocsWorkflow } from "./routers/docs-router";

const posthog = new PostHog(env.POSTHOG_PUBLIC_KEY, {
  host: "https://t.shiru.sh",
});

const handleError = async (error: unknown, userId: string, source: "hono" | "orpc") => {
  log.error(`[${source.toUpperCase()} Error]`, error, { userId });
  if (env.ENVIRONMENT !== "dev") {
    await posthog.captureExceptionImmediate(error, userId);
    await posthog.flush();
  }
};

export type Env = { Bindings: CloudflareBindings };
const app = new Hono<Env>();
const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError(async (error, { context }) => {
      await handleError(error, context.user?.id || "", "orpc");
    }),
  ],
  plugins: [new ResponseHeadersPlugin()],
});

app.onError(async (err, c) => {
  const context = await createContext(c);
  await handleError(err, context.user?.id || "", "hono");
  return c.text("Internal Server Error", 500);
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

app.use(
  rateLimiter({
    binding: env.RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
  }),
);

app.use(logger());

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
    return c.newResponse(response.body, response);
  }

  await next();
});

app.route("/github", githubRoutes);

// export class DocsBuilder extends Container<Env> {
//   // Port the container listens on (default: 8080)
//   defaultPort = 8080;
//   // Time before container sleeps due to inactivity (default: 30s)
//   sleepAfter = "2m";
//   // Environment variables passed to the container
//   envVars = {
//     MESSAGE: "I was passed in via the container class!",
//   };

//   // Optional lifecycle hooks
//   override onStart() {
//     console.log("Container successfully started");
//   }

//   override onStop() {
//     console.log("Container successfully shut down");
//   }

//   override onError(error: unknown) {
//     console.log("Container error:", error);
//   }
// }

export { app };
export default app;
