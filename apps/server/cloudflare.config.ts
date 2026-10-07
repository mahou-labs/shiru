import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "shiru-server",
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
      CORS_ORIGIN: bindings.secret(),
      BETTER_AUTH_SECRET: bindings.secret(),
      BETTER_AUTH_URL: bindings.secret(),
      POLAR_ACCESS_TOKEN: bindings.secret(),
      POLAR_SUCCESS_URL: bindings.secret(),
    },
  },
});
