/// <reference types="vite/client" />

import { DOCS_ROOT, type Draft } from "./drafts";

// The site template, bundled into the Worker. Text comes in `?raw`, which is exact for UTF-8. A
// binary comes in `?url&inline`, a base64 data URL of its bytes; the extensions name every binary
// the template has, and a missing one fails the template test. The exclusions mirror the template's
// .gitignore, so a local build or secret never ships.
const text = import.meta.glob<string>(
  [
    "../../../../packages/site-template/**",
    "!../../../../packages/site-template/**/*.{ico,ttf,woff,woff2,png,jpg,jpeg,gif,webp,avif}",
    "!../../../../packages/site-template/**/node_modules/**",
    "!../../../../packages/site-template/**/dist/**",
    "!../../../../packages/site-template/**/.astro/**",
    "!../../../../packages/site-template/**/.wrangler/**",
    "!../../../../packages/site-template/**/.nimbus/**",
    "!../../../../packages/site-template/**/.env*",
    "!../../../../packages/site-template/**/.dev.vars*",
    "!../../../../packages/site-template/**/*-debug.log*",
    "!../../../../packages/site-template/**/yarn-error.log*",
    "!../../../../packages/site-template/**/.DS_Store",
    "!../../../../packages/site-template/**/.idea/**",
    "!../../../../packages/site-template/**/.vscode/**",
  ],
  // Exhaustive takes dotfiles too, and stops leaving node_modules out; the patterns above do that.
  { query: "?raw", import: "default", eager: true, exhaustive: true },
);
const binary = import.meta.glob<string>(
  [
    "../../../../packages/site-template/public/**/*.{ico,ttf,woff,woff2,png,jpg,jpeg,gif,webp,avif}",
  ],
  { query: "?url&inline", import: "default", eager: true },
);

const TEMPLATE_DIR = "../../../../packages/site-template/";
const encoder = new TextEncoder();

/** The site template's files, by their path in a doc's docs root. */
const templateFiles = new Map<string, Uint8Array>(
  [
    ...Object.entries(text).map(([path, content]) => [path, encoder.encode(content)] as const),
    ...Object.entries(binary).map(([path, url]) => {
      const base64 = url.slice(url.indexOf(",") + 1);
      return [path, Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))] as const;
    }),
  ].map(([path, content]) => [path.slice(TEMPLATE_DIR.length), content]),
);

/** The files a doc starts with: the whole site template, with the doc's name in docs.config.json. */
export function starterDrafts(docName: string, user: string, now: number): Draft[] {
  const files = new Map(templateFiles);
  files.set(
    "docs.config.json",
    encoder.encode(`${JSON.stringify({ version: 1, name: docName }, null, 2)}\n`),
  );
  return [...files].map(([path, content]) => ({
    path: `${DOCS_ROOT}${path}`,
    op: "put",
    content,
    baseBlobSha: null,
    conflict: false,
    updatedAt: now,
    updatedBy: user,
  }));
}
