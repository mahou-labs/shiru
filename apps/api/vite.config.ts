import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: process.env.VITEST ? [] : [cloudflare()],
  server: {
    port: 3000,
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
      // builder.ts drives a container and only runs under cf dev; scripts/verify-builder.sh covers it.
      exclude: [
        "src/**/*.test.ts",
        "src/test/**",
        "src/schema/**",
        "src/utils/db.ts",
        "src/builder/builder.ts",
      ],
      thresholds: { statements: 85, branches: 75, functions: 80, lines: 85 },
    },
  },
});
