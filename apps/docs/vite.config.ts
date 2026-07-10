import { cloudflare } from "@cloudflare/vite-plugin";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite-plus";

const testWorkerEntry = new URL("./dist/server/index.js", import.meta.url).pathname;
const testCloudflareResources = {
  compatibilityDate: "2026-07-08",
  compatibilityFlags: ["nodejs_compat"],
  kvNamespaces: { DOCS_KV: "docs-test" },
  r2Buckets: { DOCS_SOURCE: "docs-source-test" },
};

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    process.env.VITEST
      ? cloudflareTest({
          miniflare: {
            ...testCloudflareResources,
            serviceBindings: { DOCS_WORKER: "shiru-docs-test" },
            workers: [
              {
                ...testCloudflareResources,
                name: "shiru-docs-test",
                modules: true,
                modulesRules: [{ include: ["**/*.js"], type: "ESModule" }],
                scriptPath: testWorkerEntry,
              },
            ],
          },
        })
      : cloudflare({
          persistState: { path: "../../.wrangler/state" },
          viteEnvironment: { childEnvironments: ["rsc"], name: "ssr" },
        }),
    tailwindcss(),
    tanstackStart({
      rsc: {
        enabled: true,
      },
    }),
    rsc(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  test: {
    globalSetup: ["./test-global-setup.ts"],
  },
});

export default config;
