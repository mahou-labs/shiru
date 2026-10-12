import { describe, expect, it } from "vite-plus/test";

import {
  isAssetPath,
  manifestResult,
  parseBuildSiteOutput,
  sourceDir,
  sourcePathError,
} from "./protocol";

describe("sourcePathError", () => {
  it("accepts nested relative paths, including spaces and dotfiles", () => {
    expect(
      ["docs/content/index.mdx", "assets/my logo.png", ".well-known/x.json"].map(sourcePathError),
    ).toEqual([undefined, undefined, undefined]);
  });

  it("rejects paths that could leave /work/src or confuse the filesystem", () => {
    expect(
      ["", "/etc/passwd", "../secret", "docs/../../x", "docs//a", "./a", "a\\b", "a\u0000b"].map(
        sourcePathError,
      ),
    ).toEqual([
      '"" is empty or too long',
      "/etc/passwd must be relative",
      "../secret has an empty, . or .. segment",
      "docs/../../x has an empty, . or .. segment",
      "docs//a has an empty, . or .. segment",
      "./a has an empty, . or .. segment",
      "a\\b has a backslash or a control character",
      "a\u0000b has a backslash or a control character",
    ]);
  });

  it("rejects a path longer than 1024 characters", () => {
    expect(sourcePathError("a".repeat(1025))).toBe(`"${"a".repeat(1025)}" is empty or too long`);
  });
});

describe("sourceDir", () => {
  it("maps the repository root and nested roots under /work/src", () => {
    expect([sourceDir(""), sourceDir("."), sourceDir("docs/"), sourceDir("site/docs")]).toEqual([
      "/work/src",
      "/work/src",
      "/work/src/docs",
      "/work/src/site/docs",
    ]);
  });

  it("refuses a root outside the source", () => {
    expect(sourceDir("../etc")).toEqual({ error: "docsRoot ../etc has an empty, . or .. segment" });
  });
});

describe("isAssetPath", () => {
  it("accepts absolute URL paths of built files", () => {
    expect(
      ["/index.html", "/_astro/_..CkV2GIs2.css", "/.well-known/ard.json"].map(isAssetPath),
    ).toEqual([true, true, true]);
  });

  it("refuses relative paths and traversal", () => {
    expect(["index.html", "/../etc/passwd", "/", "/a//b"].map(isAssetPath)).toEqual([
      false,
      false,
      false,
      false,
    ]);
  });
});

describe("parseBuildSiteOutput", () => {
  it("returns the template version from a successful build", () => {
    expect(
      parseBuildSiteOutput(0, 'astro noise\n{"ok":true,"templateVersion":"0.4.0"}\n', ""),
    ).toEqual({ ok: true, templateVersion: "0.4.0" });
  });

  it("returns the errors build-site reported", () => {
    expect(
      parseBuildSiteOutput(
        1,
        '{"ok":false,"errors":["content/index.mdx:5:1 import statements are not allowed"]}\n',
        "",
      ),
    ).toEqual({ ok: false, errors: ["content/index.mdx:5:1 import statements are not allowed"] });
  });

  it("caps the number and length of errors", () => {
    const errors = Array.from({ length: 52 }, (_, i) => `${i}`.padEnd(5000, "x"));
    const result = parseBuildSiteOutput(1, JSON.stringify({ ok: false, errors }), "");
    expect(result.ok === false && result.errors.length).toBe(51);
    expect(result.ok === false && result.errors[0]).toBe("0".padEnd(4000, "x"));
    expect(result.ok === false && result.errors[50]).toBe("and 2 more errors");
  });

  it("reports a timeout from coreutils timeout", () => {
    expect(parseBuildSiteOutput(124, "", "")).toEqual({
      ok: false,
      errors: ["the build took longer than 300 seconds"],
    });
  });

  it("reports a crash with the end of stderr", () => {
    expect(parseBuildSiteOutput(1, "", "TypeError: boom\n")).toEqual({
      ok: false,
      errors: ["build-site exited with code 1 and no result:\nTypeError: boom"],
    });
  });

  it("does not trust a success line from a failed process", () => {
    expect(parseBuildSiteOutput(137, '{"ok":true,"templateVersion":"0.4.0"}', "")).toEqual({
      ok: false,
      errors: ["build-site exited with code 137 and no result"],
    });
  });
});

describe("manifestResult", () => {
  const entry = { path: "/index.html", size: 25544, hash: "6557d84ac976d6185b43efbc8df3d80c" };

  it("returns the manifest with the template version", () => {
    expect(manifestResult("0.4.0", 0, `${JSON.stringify([entry])}\n`)).toEqual({
      ok: true,
      templateVersion: "0.4.0",
      manifest: [entry],
    });
  });

  it("rejects entries a hostile container could use to escape the site", () => {
    const traversal = JSON.stringify([{ ...entry, path: "/../x" }]);
    const badHash = JSON.stringify([{ ...entry, hash: "XYZ" }]);
    expect([
      manifestResult("0.4.0", 0, traversal),
      manifestResult("0.4.0", 0, badHash),
      manifestResult("0.4.0", 0, "not json"),
      manifestResult("0.4.0", 1, JSON.stringify([entry])),
    ]).toEqual(
      Array.from({ length: 4 }, () => ({
        ok: false,
        errors: ["the build output could not be listed"],
      })),
    );
  });

  it("fails a site whose manifest would not fit in a Workflow step result", () => {
    const manifest = Array.from({ length: 12_000 }, (_, i) => ({
      ...entry,
      path: `/guides/page-${i}/index.html`,
    }));
    expect(manifestResult("0.4.0", 0, JSON.stringify(manifest))).toEqual({
      ok: false,
      errors: ["the site built 12000 files, more than one publish can deploy"],
    });
  });
});
