#!/usr/bin/env node
// build-site <projectDir> <outDir>, with SITE_URL in the environment.
// Diagnostics go to stderr. The last stdout line is one JSON object:
// {"ok":true,"templateVersion":"…"} or {"ok":false,"errors":["…"]}.
import { spawn } from "node:child_process";
import { cp, lstat, readdir, readFile, readlink, rm, symlink } from "node:fs/promises";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { type DocsConfig, formatPath, type NavItem, parseDocsConfig } from "./config.ts";

// The image installs the site template's dependencies here; builds run with no network.
const templateDir = path.resolve(import.meta.dirname, "../template");
const imageModules = path.join(templateDir, "node_modules");
const pagesDir = "src/content/docs";

const [project, outDir] = process.argv.slice(2);
const siteUrl = process.env.SITE_URL;
if (!project || !outDir || !siteUrl || !URL.canParse(siteUrl)) {
  console.error("usage: SITE_URL=https://… build-site <projectDir> <outDir>");
  finish(2, {
    ok: false,
    errors: ["build-site needs <projectDir>, <outDir> and a valid SITE_URL"],
  });
}

const errors: string[] = [];
const pages = (await listFiles(project, pagesDir, errors)).filter((file) => /\.mdx?$/.test(file));
const publicFiles = await listFiles(project, "public", errors);
const routes = new Set(pages.map(routeOf));

if (!routes.has("/")) errors.push(`${pagesDir}/index.mdx is required, it is the home page`);

const config = await readConfig();
if (config) {
  if (config.logo && !publicFiles.includes(config.logo)) {
    errors.push(`docs.config.json: logo ${config.logo} does not exist`);
  }
  errors.push(...checkNavigation(config.navigation ?? [], ["navigation"], routes));
}

const projectPrefix = `${path.resolve(project)}/`;
const modules = path.join(project, "node_modules");
const linked = await readlink(modules).catch(() => undefined);
if (linked !== imageModules && (await lstat(modules).catch(() => undefined))) {
  errors.push("node_modules is committed; remove it, the builder provides the dependencies");
}

if (errors.length > 0 || !config) {
  for (const error of errors) console.error(error);
  finish(1, { ok: false, errors });
}

if (!linked) await symlink(imageModules, modules);
// The container is reused between builds, so remove everything a previous build wrote, the
// caches it shares through node_modules included.
for (const dir of ["dist", ".astro", ".nimbus", "node_modules/.astro", "node_modules/.vite"]) {
  await rm(path.join(project, dir), { recursive: true, force: true });
}

const astro = await runBin("astro", ["build"]);
if (astro.code !== 0) {
  finish(1, { ok: false, errors: [`astro build failed:\n${astro.tail}`] });
}
// The template's own lint, where its rules (internal links, frontmatter) fail a build. It reads the
// route list astro build just wrote.
const lint = await runBin("nimbus-docs", ["lint"]);
if (lint.code !== 0) {
  finish(1, { ok: false, errors: [`nimbus-docs lint failed:\n${lint.tail}`] });
}

await rm(outDir, { recursive: true, force: true });
await cp(path.join(project, "dist"), outDir, { recursive: true });

const { version } = JSON.parse(await readFile(path.join(templateDir, "package.json"), "utf8"));
finish(0, { ok: true, templateVersion: version });

function finish(code: number, result: object): never {
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exit(code);
}

async function readConfig(): Promise<DocsConfig | undefined> {
  let text: string;
  try {
    text = await readFile(path.join(project!, "docs.config.json"), "utf8");
  } catch {
    errors.push("docs.config.json: file not found");
    return undefined;
  }
  const result = parseDocsConfig(text);
  if (result.ok) return result.config;
  errors.push(...result.errors);
  return undefined;
}

/** Files under root/dir as root-relative paths. Links are refused: content must not point outside the project. */
async function listFiles(root: string, dir: string, errors: string[]): Promise<string[]> {
  const entries = await readdir(path.join(root, dir), {
    recursive: true,
    withFileTypes: true,
  }).catch(() => undefined);
  if (!entries) {
    if (dir === pagesDir) errors.push(`${pagesDir}/ directory is missing`);
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
    .slice(pagesDir.length + 1)
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
      : [`docs.config.json: ${formatPath([...at, i, "href"])} points to no page in ${pagesDir}/`];
  });
}

/** Runs a binary of the image's dependencies in the project, with only the environment it needs. */
function runBin(bin: string, args: string[]): Promise<{ code: number | null; tail: string }> {
  return new Promise((resolve) => {
    const child = spawn(path.join(imageModules, ".bin", bin), args, {
      cwd: project,
      env: {
        PATH: process.env.PATH,
        SITE_URL: siteUrl,
        HOME: process.env.HOME ?? "/tmp",
        ASTRO_TELEMETRY_DISABLED: "1",
        NO_COLOR: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let tail = "";
    const keep = (chunk: Buffer) => {
      // Rolldown colors its diagnostics even with NO_COLOR set.
      // Rolldown names files by absolute path; authors know them by their path in the project.
      const text = stripVTControlCharacters(chunk.toString()).replaceAll(projectPrefix, "");
      process.stderr.write(text);
      tail = (tail + text).slice(-4000);
    };
    child.stdout.on("data", keep);
    child.stderr.on("data", keep);
    child.on("close", (code) => resolve({ code, tail: tail.trim() }));
  });
}
