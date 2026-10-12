#!/usr/bin/env node
// build-site <srcDocsRoot> <outDir>, with SITE_URL in the environment.
// Diagnostics go to stderr. The last stdout line is one JSON object:
// {"ok":true,"templateVersion":"…"} or {"ok":false,"errors":["…"]}.
import { spawn } from "node:child_process";
import { cp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { markdownToMdast, mdxToMdast, type MdastNode } from "satteri";
import { markdownFeatures } from "../template/markdown.ts";
import { type DocsConfig, formatPath, type NavItem, parseDocsConfig } from "./config.ts";

const templateDir = path.resolve(import.meta.dirname, "../template");
// Astro reports pages at their copy inside the template; authors know them as content/.
const contentCopyPath = new RegExp(`(?:${RegExp.escape(templateDir)}/)?src/content/docs/`, "g");
const features = { gfm: true, smartPunctuation: true, ...markdownFeatures };

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
const prepared = new Map<string, string>();
for (const page of pages) {
  const result = preparePage(page, await readFile(path.join(srcRoot, page), "utf8"));
  errors.push(...result.errors);
  prepared.set(page, result.source);
}

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
for (const [page, source] of prepared) {
  await writeFile(
    path.join(templateDir, "src/content/docs", path.relative("content", page)),
    source,
  );
}
if (assets.length > 0) {
  await cp(path.join(srcRoot, "assets"), path.join(templateDir, "public/assets"), {
    recursive: true,
  });
}
await writeFile(path.join(templateDir, "site.json"), JSON.stringify(siteJson, null, 2));

const astro = await runAstroBuild();
if (astro.code !== 0) {
  finish(1, { ok: false, errors: [`astro build failed:\n${astro.tail}`] });
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

/**
 * Checks one page for links to missing pages, the one page check Nimbus does
 * not make. Also returns the source with
 * file-relative page links (`../setup.mdx#install`) rewritten to routes
 * (`/guides/setup/#install`), the only form Nimbus resolves in both the HTML
 * and the Markdown it emits.
 */
function preparePage(file: string, source: string): { errors: string[]; source: string } {
  let tree: MdastNode;
  try {
    tree = file.endsWith(".mdx")
      ? mdxToMdast(source, { features })
      : markdownToMdast(source, { features });
  } catch (error) {
    const message = (error as Error).message;
    const at = /^(\d+):(\d+): ([\s\S]*)$/.exec(message);
    return { errors: [at ? `${file}:${at[1]}:${at[2]} ${at[3]}` : `${file} ${message}`], source };
  }

  const errors: string[] = [];
  const edits: { offset: number; from: string; to: string }[] = [];
  const report = (
    node: { position?: { start: { line: number; column: number } } },
    message: string,
  ) => {
    const start = node.position?.start ?? { line: 1, column: 1 };
    errors.push(`${file}:${start.line}:${start.column} ${message}`);
  };

  const visit = (node: MdastNode) => {
    switch (node.type) {
      case "link":
      case "definition": {
        const [, target, suffix = ""] = /^([^:?#]*\.mdx?)([?#].*)?$/.exec(node.url) ?? [];
        if (!target || target.startsWith("/")) break;
        const route = routeOf(path.posix.join(path.posix.dirname(file), target));
        const offset = destinationOffset(source, node);
        if (!routes.has(route)) report(node, `link ${node.url} points to no page in content/`);
        else if (offset >= 0 && source.startsWith(node.url, offset)) {
          edits.push({
            offset,
            from: node.url,
            to: `${route === "/" ? "/" : `${route}/`}${suffix}`,
          });
        } else report(node, `link ${node.url} must be written without escapes`);
        break;
      }
    }
    if ("children" in node) for (const child of node.children) visit(child as MdastNode);
  };
  visit(tree);

  let rewritten = source;
  for (const { offset, from, to } of edits.sort((a, b) => b.offset - a.offset)) {
    rewritten = rewritten.slice(0, offset) + to + rewritten.slice(offset + from.length);
  }
  return { errors, source: rewritten };
}

/** Where a link's destination starts in the source: after `](` for links, after `]:` for definitions. */
function destinationOffset(
  source: string,
  node: MdastNode & { type: "link" | "definition" },
): number {
  const start = node.position?.start.offset ?? 0;
  const end = node.position?.end.offset ?? source.length;
  const after =
    node.type === "link" ? (node.children.at(-1)?.position?.end.offset ?? start) : start;
  const marker = node.type === "link" ? /\]\s*\(\s*<?/g : /(?<!\\)\]\s*:\s*<?/g;
  marker.lastIndex = after;
  const match = marker.exec(source.slice(0, end));
  return match ? match.index + match[0].length : -1;
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

/** Runs astro with only the environment it needs; the sandbox passes PATH and SITE_URL and nothing else. */
function runAstroBuild(): Promise<{ code: number | null; tail: string }> {
  return new Promise((resolve) => {
    const child = spawn(path.join(templateDir, "node_modules/.bin/astro"), ["build"], {
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
