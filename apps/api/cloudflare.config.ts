import { existsSync } from "node:fs";

import { bindings, defineConfig } from "cf/config";

const developmentDefaults = {
  CORS_ORIGIN: "http://localhost:3001",
  BETTER_AUTH_URL: "http://localhost:3000",
  POLAR_SUCCESS_URL: "http://localhost:3001/success?checkout_id={CHECKOUT_ID}",
};

export default defineConfig(({ mode }) => {
  const development = mode === "development";
  if (!development && existsSync(".env.production")) process.loadEnvFile(".env.production");
  const text = (name: keyof typeof developmentDefaults) => {
    const value = development ? developmentDefaults[name] : process.env[name];
    if (!value) throw new Error(`Set ${name} in apps/api/.env.production`);
    return bindings.text(value);
  };

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
        DATABASE_URL: bindings.secret(),
        CORS_ORIGIN: text("CORS_ORIGIN"),
        BETTER_AUTH_SECRET: bindings.secret(),
        BETTER_AUTH_URL: text("BETTER_AUTH_URL"),
        POLAR_ACCESS_TOKEN: bindings.secret(),
        POLAR_SUCCESS_URL: text("POLAR_SUCCESS_URL"),
        POSTHOG_KEY: bindings.text(development ? "" : (process.env.POSTHOG_KEY ?? "")),
        POSTHOG_HOST: bindings.text(process.env.POSTHOG_HOST ?? "https://us.i.posthog.com"),
      },
    },
  };
});
