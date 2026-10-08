import { bindings, defineConfig } from "cf/config";

export default defineConfig(({ mode }) => {
  const development = mode === "development";

  return {
    worker: {
      name: "shiru-api",
      entrypoint: "./src/index.ts",
      compatibilityDate: "2026-10-07",
      compatibilityFlags: ["nodejs_compat"],
      observability: {
        enabled: true,
        traces: {
          enabled: true,
          headSamplingRate: 0.1,
        },
      },
      env: {
        DB: bindings.d1({ name: "shiru-api", id: "094e93eb-7015-487f-8888-7d5013a4a8e5" }),
        DASHBOARD_URL: bindings.secret(),
        BETTER_AUTH_SECRET: bindings.secret(),
        BETTER_AUTH_URL: bindings.secret(),
        POLAR_ACCESS_TOKEN: bindings.secret(),
        POLAR_WEBHOOK_SECRET: bindings.secret(),
        ENVIRONMENT: bindings.text(development ? "development" : "production"),
        EMAIL: bindings.sendEmail({ dev: { remote: false } }),
        POSTHOG_KEY: development ? bindings.text("") : bindings.secret(),
        POSTHOG_HOST: bindings.text("https://us.i.posthog.com"),
      },
    },
  };
});
