import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [cloudflare({ persistState: true })],
  resolve: { tsconfigPaths: true },
  server: { cors: false },
});
