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
        ENVIRONMENT: bindings.text(development ? "development" : "production"),
        EMAIL: bindings.sendEmail({ dev: { remote: false } }),
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
