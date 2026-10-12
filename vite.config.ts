import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    ignorePatterns: [
      "node_modules/**",
      "**/node_modules/**",
      "apps/dashboard/dist/**",
      "apps/dashboard/.tanstack/**",
      "apps/dashboard/src/routeTree.gen.ts",
      "apps/api/dist/**",
      "apps/api/drizzle/**",
      "apps/site/dist/**",
      "apps/site/.astro/**",
      "apps/builder/template/**",
      "**/.cloudflare/**",
      "**/.impeccable/**",
      ".wrangler/**",
      "**/.wrangler/**",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: [
      "node_modules/**",
      "**/node_modules/**",
      "apps/dashboard/dist/**",
      "apps/dashboard/.tanstack/**",
      "apps/dashboard/src/routeTree.gen.ts",
      "apps/api/dist/**",
      "apps/api/drizzle/**",
      "apps/site/dist/**",
      "apps/site/.astro/**",
      "apps/builder/template/**",
      "apps/builder/docs.config.schema.json",
      "**/.cloudflare/**",
      "**/.impeccable/**",
      ".wrangler/**",
      "**/.wrangler/**",
    ],
    singleQuote: false,
    semi: true,
    sortPackageJson: true,
  },
  staged: {
    "*.{js,ts,jsx,tsx,vue,svelte,json,jsonc,css,md}": "vp check --fix",
  },
});
