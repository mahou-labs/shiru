import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: process.env.VITEST
    ? []
    : [
        cloudflare({ types: { generate: false }, inspectorPort: false }),
        tailwindcss(),
        tanstackRouter({
          target: "react",
          autoCodeSplitting: true,
        }),
        react({ compiler: true }),
      ],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
