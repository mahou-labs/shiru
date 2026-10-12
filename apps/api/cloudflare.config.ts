import { bindings, defineConfig, exports } from "cf/config";

export default defineConfig(({ mode }) => {
  const development = mode === "development";

  return {
    worker: {
      name: "shiru-api",
      entrypoint: "./src/index.ts",
      compatibilityDate: "2026-10-07",
      compatibilityFlags: ["nodejs_compat"],
      domains: ["api.shiru.sh"],
      observability: {
        enabled: true,
        traces: {
          enabled: true,
          headSamplingRate: 0.1,
        },
      },
      env: {
        DB: bindings.d1({ name: "shiru-api", id: "094e93eb-7015-487f-8888-7d5013a4a8e5" }),
        DASHBOARD_URL: bindings.text(
          development ? "http://localhost:3001" : "https://app.shiru.sh",
        ),
        SITE_URL: bindings.text(development ? "http://localhost:3002" : "https://shiru.sh"),
        BETTER_AUTH_SECRET: bindings.secret(),
        BETTER_AUTH_URL: bindings.text(
          development ? "http://localhost:3000" : "https://api.shiru.sh",
        ),
        POLAR_ACCESS_TOKEN: bindings.secret(),
        POLAR_WEBHOOK_SECRET: bindings.secret(),
        POLAR_MONTHLY_PRODUCT_ID: bindings.text(
          development
            ? "886797b2-ee38-459c-9904-9d76ba5c50af"
            : "57d8f9c8-0eb7-40e3-9a24-7d3927b1af71",
        ),
        POLAR_YEARLY_PRODUCT_ID: bindings.text(
          development
            ? "b8a0905d-e14c-4e9d-afaa-7af02bdc940a"
            : "dceaf15a-dad4-4809-a4cc-ce048ff90a87",
        ),
        ENVIRONMENT: bindings.text(development ? "development" : "production"),
        EMAIL: bindings.sendEmail({ dev: { remote: false } }),
        // Per-IP limits enforced in src/utils/rate-limit.ts. Namespace ids are unique per account.
        API_RATE_LIMITER: bindings.rateLimit({
          namespace: "1001",
          simple: { limit: 300, period: 60 },
        }),
        PUBLIC_WRITE_RATE_LIMITER: bindings.rateLimit({
          namespace: "1002",
          simple: { limit: 10, period: 60 },
        }),
        // No PostHog project yet. Switch to bindings.secret() in production once a key exists.
        POSTHOG_KEY: bindings.text(""),
        POSTHOG_HOST: bindings.text("https://us.i.posthog.com"),
      },
      exports: {
        // The previous app on this Worker ran a Durable Object; retiring it lets this code deploy.
        BuilderSandbox: exports.durableObject({ state: "deleted" }),
      },
    },
  };
});
