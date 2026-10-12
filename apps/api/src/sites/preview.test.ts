import { describe, expect, it } from "vite-plus/test";

import { contentType, relativeLocation, serveAsset } from "./preview";

const text = (value: string) => new TextEncoder().encode(value);

function build(paths: string[]) {
  const files = new Map(paths.map((path) => [path, text(`contents of ${path}`)]));
  return async (path: string) => files.get(path) ?? null;
}

const site = build([
  "/index.html",
  "/guides/setup/index.html",
  "/guides/setup/index.md",
  "/about.html",
  "/404.html",
]);

async function serve(path: string, read = site) {
  const served = await serveAsset(path, read);
  return served.kind === "file"
    ? { status: served.status, path: served.path, body: new TextDecoder().decode(served.body) }
    : served;
}

describe("serveAsset", () => {
  it.each([
    ["/", { status: 200, path: "/index.html", body: "contents of /index.html" }],
    [
      "/guides/setup/",
      {
        status: 200,
        path: "/guides/setup/index.html",
        body: "contents of /guides/setup/index.html",
      },
    ],
    [
      "/guides/setup/index.md",
      { status: 200, path: "/guides/setup/index.md", body: "contents of /guides/setup/index.md" },
    ],
    ["/about", { status: 200, path: "/about.html", body: "contents of /about.html" }],
    ["/guides/setup", { kind: "redirect", location: "setup/" }],
    ["/guides/setup/index.html", { kind: "redirect", location: "./" }],
    ["/index.html", { kind: "redirect", location: "./" }],
    ["/about.html", { kind: "redirect", location: "about" }],
    ["/about/", { kind: "redirect", location: "../about" }],
    ["/missing", { status: 404, path: "/404.html", body: "contents of /404.html" }],
    ["/missing.html", { status: 404, path: "/404.html", body: "contents of /404.html" }],
  ])("serves %s like auto-trailing-slash", async (path, expected) => {
    expect(await serve(path)).toEqual(expected);
  });

  it("answers not found when the build has no 404 page", async () => {
    expect(await serve("/missing", build(["/index.html"]))).toEqual({ kind: "not_found" });
  });
});

describe("relativeLocation", () => {
  it("climbs out of directories the target is not in", () => {
    expect(relativeLocation("/a/b/c/", "/a/x")).toBe("../../x");
    expect(relativeLocation("/a", "/")).toBe("./");
  });
});

describe("contentType", () => {
  it("types files by extension", () => {
    expect(["/a/index.html", "/index.md", "/logo.SVG", "/blob"].map(contentType)).toEqual([
      "text/html; charset=utf-8",
      "text/markdown; charset=utf-8",
      "image/svg+xml",
      "application/octet-stream",
    ]);
  });
});
