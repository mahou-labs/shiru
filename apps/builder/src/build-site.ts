#!/usr/bin/env node
// build-site <srcDocsRoot> <outDir>, with SITE_URL in the environment.
// Diagnostics go to stderr. The last stdout line is one JSON object:
// {"ok":true,"templateVersion":"…"} or {"ok":false,"errors":["…"]}.
import { spawn } from "node:child_process";
import { cp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { type DocsConfig, formatPath, type NavItem, parseDocsConfig } from "./config.ts";

const templateDir = path.resolve(import.meta.dirname, "../template");
// Astro reports pages at their copy inside the template; authors know them as content/.
const contentCopyPath = new RegExp(`(?:${RegExp.escape(templateDir)}/)?src/content/docs/`, "g");

const [srcRoot, outDir] = process.argv.slice(2);
const siteUrl = process.env.SITE_URL;
if (!srcRoot || !outDir || !siteUrl || !URL.canParse(siteUrl)) {
  console.error("usage: SITE_URL=https://… build-site <srcDocsRoot> <outDir>");
  finish(2, {
    ok: false,
    errors: ["build-site needs <srcDocsRoot>, <outDir> and a valid SITE_URL"],
  });
}

const errors: string[] = [];
const files = await listFiles(srcRoot, "content", errors);
const assets = await listFiles(srcRoot, "assets", errors);
const pages = files.filter((file) => /\.mdx?$/.test(file));
const routes = new Set(pages.map(routeOf));

if (!routes.has("/")) errors.push("content/index.mdx is required, it is the home page");

const config = await readConfig();
if (config) {
  if (config.logo && !assets.includes(config.logo)) {
    errors.push(`docs.config.json: logo ${config.logo} does not exist`);
  }
  errors.push(...checkNavigation(config.navigation ?? [], ["navigation"], routes));
}

if (errors.length > 0 || !config) {
  for (const error of errors) console.error(error);
  finish(1, { ok: false, errors });
}

const siteJson = {
  nimbus: {
    site: siteUrl.replace(/\/$/, ""),
    title: config.name,
    description: config.description,
    github: config.github ?? null,
    socialImageAlt: `${config.name} documentation`,
    sidebar: config.navigation && { items: config.navigation.map(toSidebarItem) },
  },
  logo: config.logo ? `/${config.logo}` : null,
};

// The container is reused between builds, so remove everything a previous
// build wrote, caches included, before copying this source in.
for (const dir of [
  "src/content/docs",
  "public/assets",
  "dist",
  ".astro",
  ".nimbus",
  "node_modules/.astro",
]) {
  await rm(path.join(templateDir, dir), { recursive: true, force: true });
}
await cp(path.join(srcRoot, "content"), path.join(templateDir, "src/content/docs"), {
  recursive: true,
});
if (assets.length > 0) {
  await cp(path.join(srcRoot, "assets"), path.join(templateDir, "public/assets"), {
    recursive: true,
  });
}
await writeFile(path.join(templateDir, "site.json"), JSON.stringify(siteJson, null, 2));

const astro = await runTemplateBin("astro", ["build"]);
if (astro.code !== 0) {
  finish(1, { ok: false, errors: [`astro build failed:\n${astro.tail}`] });
}
// The template's own lint, where its rules (internal links, frontmatter) fail a build. It reads the
// route list astro build just wrote.
const lint = await runTemplateBin("nimbus-docs", ["lint"]);
if (lint.code !== 0) {
  finish(1, { ok: false, errors: [`nimbus-docs lint failed:\n${lint.tail}`] });
}

await rm(outDir, { recursive: true, force: true });
await cp(path.join(templateDir, "dist"), outDir, { recursive: true });

const { version } = JSON.parse(await readFile(path.join(templateDir, "package.json"), "utf8"));
finish(0, { ok: true, templateVersion: version });

function finish(code: number, result: object): never {
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exit(code);
}

async function readConfig(): Promise<DocsConfig | undefined> {
  let text: string;
  try {
    text = await readFile(path.join(srcRoot!, "docs.config.json"), "utf8");
  } catch {
    errors.push("docs.config.json: file not found");
    return undefined;
  }
  const result = parseDocsConfig(text);
  if (result.ok) return result.config;
  errors.push(...result.errors);
  return undefined;
}

/** Files under root/dir as root-relative paths. Links are refused: content must not point outside the source. */
async function listFiles(root: string, dir: string, errors: string[]): Promise<string[]> {
  const entries = await readdir(path.join(root, dir), {
    recursive: true,
    withFileTypes: true,
  }).catch(() => undefined);
  if (!entries) {
    if (dir === "content") errors.push("content/ directory is missing");
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const rel = path.relative(root, path.join(entry.parentPath, entry.name));
    if (entry.isFile()) files.push(rel);
    else if (entry.isSymbolicLink()) errors.push(`${rel} is a symbolic link, which is not allowed`);
    else if (!entry.isDirectory()) errors.push(`${rel} is not a regular file`);
  }
  return files.sort();
}

function routeOf(page: string): string {
  const slug = page
    .replace(/^content\//, "")
    .replace(/\.mdx?$/, "")
    .replace(/(^|\/)index$/, "");
  return `/${slug}`;
}

function checkNavigation(items: NavItem[], at: (string | number)[], routes: Set<string>): string[] {
  return items.flatMap((item, i) => {
    if ("items" in item) return checkNavigation(item.items, [...at, i, "items"], routes);
    const route = item.href.length > 1 ? item.href.replace(/\/$/, "") : item.href;
    return routes.has(route)
      ? []
      : [`docs.config.json: ${formatPath([...at, i, "href"])} points to no page in content/`];
  });
}

type SidebarItem = { label: string; link: string } | { label: string; items: SidebarItem[] };

function toSidebarItem(item: NavItem): SidebarItem {
  return "items" in item
    ? { label: item.label, items: item.items.map(toSidebarItem) }
    : { label: item.label, link: item.href };
}

/** Runs a template binary with only the environment it needs; the sandbox passes PATH and SITE_URL and nothing else. */
function runTemplateBin(
  bin: string,
  args: string[],
): Promise<{ code: number | null; tail: string }> {
  return new Promise((resolve) => {
    const child = spawn(path.join(templateDir, "node_modules/.bin", bin), args, {
      cwd: templateDir,
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME ?? "/tmp",
        ASTRO_TELEMETRY_DISABLED: "1",
        NO_COLOR: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let tail = "";
    const keep = (chunk: Buffer) => {
      // Rolldown colors its diagnostics even with NO_COLOR set.
      const text = stripVTControlCharacters(chunk.toString()).replaceAll(
        contentCopyPath,
        "content/",
      );
      process.stderr.write(text);
      tail = (tail + text).slice(-4000);
    };
    child.stdout.on("data", keep);
    child.stderr.on("data", keep);
    child.on("close", (code) => resolve({ code, tail: tail.trim() }));
  });
}
