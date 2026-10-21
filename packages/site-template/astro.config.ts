import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import nimbus, { defineConfig as defineNimbusConfig } from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";
import { markdownFeatures } from "./markdown.ts";
import docs from "./docs.config.json" with { type: "json" };

type NavItem = { label: string; href: string } | { label: string; items: NavItem[] };
type SidebarItem = { label: string; link: string } | { label: string; items: SidebarItem[] };

const toSidebarItem = (item: NavItem): SidebarItem =>
  "items" in item
    ? { label: item.label, items: item.items.map(toSidebarItem) }
    : { label: item.label, link: item.href };

// shiru checks docs.config.json against its schema before every build, so the cast holds.
const { name, description, github, navigation } = docs as {
  name: string;
  description?: string;
  github?: string;
  navigation?: NavItem[];
};

const nimbusConfig = defineNimbusConfig({
  locale: "en",
  // shiru's builder sets SITE_URL to the address the site is published at.
  site: (process.env.SITE_URL ?? "http://localhost:4321").replace(/\/$/, ""),
  title: name,
  description,
  github: github ?? null,
  socialImageAlt: `${name} documentation`,
  sidebar: navigation && { items: navigation.map(toSidebarItem) },
});

export default defineConfig({
  output: "static",
  // Tailwind v4 via its Vite plugin (the PostCSS plugin doesn't build under
  // Astro 7's Vite 8 bundler).
  vite: {
    plugins: [tailwindcss()],
    // shiru's builder links node_modules in from its image. Astro takes a path outside the project
    // for a project-relative one, so dependencies must keep their linked path.
    resolve: { preserveSymlinks: true },
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
