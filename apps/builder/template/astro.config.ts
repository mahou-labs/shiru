import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import nimbus, { defineConfig as defineNimbusConfig } from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";
import { markdownFeatures } from "./markdown.ts";
// Written by build-site from the site's docs.config.json and SITE_URL.
import site from "./site.json" with { type: "json" };

const nimbusConfig = defineNimbusConfig({
  locale: "en",
  ...site.nimbus,
});

export default defineConfig({
  output: "static",
  // Tailwind v4 via its Vite plugin (the PostCSS plugin doesn't build under
  // Astro 7's Vite 8 bundler).
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    react(),
    nimbus(nimbusConfig, {
      rules: {
        "nimbus/frontmatter-shape": "error",
        "nimbus/internal-link": "error",
      },
      markdown: {
        // Wrap wide tables so they scroll (styled by `.nb-table-scroll` in
        // src/styles/prose.css).
        hastPlugins: [tableScroll()],
        features: markdownFeatures,
      },
    }),
  ],
});
