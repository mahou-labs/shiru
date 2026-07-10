import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite-plus";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    !process.env.VITEST &&
      cloudflare({
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
});

export default config;
