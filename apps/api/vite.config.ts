import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: process.env.VITEST
    ? []
    : [
        cloudflare(
          // API_STATE_DIR lets a verify script keep its local state apart from the usual server's.
          process.env.API_STATE_DIR ? { persistState: { path: process.env.API_STATE_DIR } } : {},
        ),
      ],
  server: {
    // API_PORT lets a verify script run its own server beside the usual one on 3000.
    port: Number(process.env.API_PORT) || 3000,
    strictPort: true,
    cors: false,
  },
  test: {
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    // Inlined so the cloudflare:workers mock reaches its import.
    server: { deps: { inline: ["@cloudflare/sandbox"] } },
    silent: "passed-only",
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.ts",
        "src/test/**",
        "src/schema/**",
        "src/utils/db.ts",
        // These drive a container, a push over HTTP or a Workflow, which only run under cf dev;
        // scripts/verify-builder.ts and scripts/verify-publish.ts cover them.
        "src/builder/builder.ts",
        "src/docs/doc.ts",
        "src/docs/publish-workflow.ts",
      ],
      thresholds: { statements: 85, branches: 75, functions: 80, lines: 85 },
    },
  },
});
