import { env } from "cloudflare:workers";
import { createMiddleware } from "hono/factory";

// Unauthenticated procedures that write to the database.
const PUBLIC_WRITE_PATH = /^\/(rpc|api-reference)\/waitlist\//;

export const rateLimit = createMiddleware(async (c, next) => {
  // Cloudflare sets this on every request it proxies, and clients cannot override it.
  const ip = c.req.header("cf-connecting-ip");
  if (!ip || c.req.method === "OPTIONS") return next();

  const limiter = PUBLIC_WRITE_PATH.test(c.req.path)
    ? env.PUBLIC_WRITE_RATE_LIMITER
    : env.API_RATE_LIMITER;
  const { success } = await limiter.limit({ key: ip });
  if (!success) {
    return c.json(
      { code: "RATE_LIMITED", message: "Too many requests. Try again in a minute." },
      429,
      { "Retry-After": "60" },
    );
  }
  return next();
});
