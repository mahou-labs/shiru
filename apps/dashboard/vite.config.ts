import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite-plus";

export default defineConfig(({ mode }) => {
  if (!loadEnv(mode, import.meta.dirname, "VITE_").VITE_API_URL) {
    throw new Error("Set VITE_API_URL in apps/dashboard/.env");
  }

  return {
    server: {
      port: 3001,
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      cloudflare({ types: { generate: false } }),
      tailwindcss(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react({ compiler: true }),
    ],
  };
});
