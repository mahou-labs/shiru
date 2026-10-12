import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: process.env.VITEST ? [] : [cloudflare()],
  // Docs URLs are http://<slug>.docs.localhost:3003, so a silent fallback port would break them.
  server: { port: 3003, strictPort: true },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
