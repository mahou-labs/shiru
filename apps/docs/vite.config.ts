import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: process.env.VITEST
    ? []
    : [cloudflare({ persistState: { path: "../../.wrangler/state" } })],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
  },
});
