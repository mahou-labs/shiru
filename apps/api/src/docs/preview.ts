/**
 * Serves a built doc the way Workers static assets do with `html_handling: "auto-trailing-slash"`
 * and `not_found_handling: "404-page"`, so a doc previewed locally behaves like the deployed one.
 */

export type Served =
  | { kind: "file"; path: string; status: 200 | 404; body: Uint8Array }
  | { kind: "redirect"; location: string }
  | { kind: "not_found" };

/** Reads one built file by its URL path, or null when the build has no such file. */
export type ReadFile = (path: string) => Promise<Uint8Array | null>;

export async function serveAsset(path: string, read: ReadFile): Promise<Served> {
  const file = async (target: string) => {
    const body = await read(target);
    return body ? ({ kind: "file", path: target, status: 200, body } as const) : null;
  };
  const redirect = async (target: string, ifExists: string): Promise<Served | null> =>
    (await read(ifExists)) ? { kind: "redirect", location: relativeLocation(path, target) } : null;

  let served: Served | null;
  if (path.endsWith("/")) {
    served =
      (await file(`${path}index.html`)) ??
      (path === "/" ? null : await redirect(path.slice(0, -1), `${path.slice(0, -1)}.html`));
  } else if (path.endsWith("/index.html")) {
    served = await redirect(path.slice(0, -"index.html".length), path);
  } else if (path.endsWith(".html")) {
    served = await redirect(path.slice(0, -".html".length), path);
  } else {
    served =
      (await file(path)) ??
      (await file(`${path}.html`)) ??
      (await redirect(`${path}/`, `${path}/index.html`));
  }
  if (served) return served;

  const notFound = await read("/404.html");
  return notFound
    ? { kind: "file", path: "/404.html", status: 404, body: notFound }
    : { kind: "not_found" };
}

/**
 * The Location that takes a browser from `from` to `to`, relative to `from`. A relative Location
 * works both at /dev/docs/<slug>/… on the API and at the doc's own hostname behind dispatch.
 */
export function relativeLocation(from: string, to: string) {
  const fromDir = from.split("/").slice(1, -1);
  const toParts = to.split("/").slice(1);
  const toDir = toParts.slice(0, -1);
  const name = toParts.at(-1) ?? "";
  let common = 0;
  while (common < Math.min(fromDir.length, toDir.length) && fromDir[common] === toDir[common]) {
    common++;
  }
  const location = "../".repeat(fromDir.length - common) + [...toDir.slice(common), name].join("/");
  return location === "" ? "./" : location;
}

const CONTENT_TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  json: "application/json",
  md: "text/markdown; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  xml: "application/xml",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  ico: "image/x-icon",
  woff: "font/woff",
  woff2: "font/woff2",
  pdf: "application/pdf",
};

export function contentType(path: string) {
  const extension = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}
