import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: process.env.VITEST ? [] : [cloudflare({ inspectorPort: false })],
  // Docs URLs are http://<slug>.docs.localhost:3003, so a silent fallback port would break them.
  // DISPATCH_PORT lets a verify script run its own instance beside the usual one.
  server: { port: Number(process.env.DISPATCH_PORT) || 3003, strictPort: true },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
