import { ORPCError } from "@orpc/server";
import { env, waitUntil } from "cloudflare:workers";
import { PostHog } from "posthog-node";

export function captureException(error: unknown, distinctId?: string) {
  console.error(error);
  if (!env.POSTHOG_KEY || (error instanceof ORPCError && error.status < 500)) return;
  // Workers can reuse globals across requests, so PostHog recommends a client per request.
  const posthog = new PostHog(env.POSTHOG_KEY, {
    host: env.POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  waitUntil(posthog.captureExceptionImmediate(error, distinctId).finally(() => posthog.shutdown()));
}
