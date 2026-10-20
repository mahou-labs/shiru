import { slugify } from "@/lib/slug";

import { DocPath, type FileStatus } from "../../../../api/src/docs/drafts";

export const PAGES_ROOT = "src/content/docs/";
export const HOME = "src/content/docs/index.mdx";

/** `.mdx` pages get Nimbus components, admonitions and MDX escaping. `.md` pages are plain GFM. */
export type Flavor = "md" | "mdx";

/** The flavor of an editable page, or null when the path is not a page. */
export function flavorOf(path: string): Flavor | null {
  if (path.endsWith(".mdx")) return "mdx";
  if (path.endsWith(".md")) return "md";
  return null;
}

/** The URL a page serves, as build-site derives it: `src/content/docs/a/index.mdx` serves `/a`. */
export function routeOf(path: string) {
  const slug = path
    .replace(/^src\/content\/docs\//, "")
    .replace(/\.mdx?$/, "")
    .replace(/(^|\/)index$/, "");
  return `/${slug}`;
}

/** The home page cannot go: the build fails without a page at `/`. */
export const isHome = (path: string) => path.startsWith(PAGES_ROOT) && routeOf(path) === "/";

/** Where a page titled `title` goes in `folder` (a path ending in `/`, under `src/content/docs/`). */
export function suggestPath(folder: string, title: string) {
  const slug = slugify(title);
  return slug ? `${folder}${slug}.mdx` : "";
}

/** Why `path` cannot be a new page next to `files`, or undefined when it can. */
export function newPagePathError(path: string, files: FileStatus[]): string | undefined {
  const parsed = DocPath.safeParse(path);
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "This path is not valid";
  if (!path.startsWith(PAGES_ROOT)) return "Pages live in src/content/docs/";
  if (!/[^/]\.mdx?$/.test(path)) return "A page ends in .mdx or .md";
  const route = routeOf(path);
  const taken = files.find(
    (file) =>
      file.status !== "deleted" &&
      (file.path === path || (file.path.startsWith(PAGES_ROOT) && routeOf(file.path) === route)),
  );
  if (!taken) return undefined;
  return taken.path === path ? `${path} already exists` : `${taken.path} already serves ${route}`;
}

/** A new page's source: the title in front matter, as a JSON string so MDX reads it as text. */
export const newPageSource = (title: string) => `---\ntitle: ${JSON.stringify(title)}\n---\n\n`;

/** The tree after a save of `status`, which may be a page the tree has not seen. */
export function withFile(files: FileStatus[], status: FileStatus): FileStatus[] {
  const rest = files.filter((file) => file.path !== status.path);
  return [...rest, status].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}
