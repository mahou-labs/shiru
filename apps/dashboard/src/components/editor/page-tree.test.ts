import { describe, expect, test } from "vite-plus/test";

import { buildTree } from "./page-tree";

const file = (path: string) => ({ path, status: "unchanged" as const, conflict: false });

describe("buildTree", () => {
  test("nests pages by folder under src/content/docs/, index first and folders last", () => {
    expect(
      buildTree([
        file("src/content/docs/guides/setup.mdx"),
        file("src/content/docs/zeta.md"),
        file("src/content/docs/index.mdx"),
        file("src/content/docs/guides/index.mdx"),
        file("src/content/docs/about.mdx"),
      ]),
    ).toEqual([
      { kind: "page", name: "index", file: file("src/content/docs/index.mdx") },
      { kind: "page", name: "about", file: file("src/content/docs/about.mdx") },
      { kind: "page", name: "zeta", file: file("src/content/docs/zeta.md") },
      {
        kind: "folder",
        name: "guides",
        children: [
          { kind: "page", name: "index", file: file("src/content/docs/guides/index.mdx") },
          { kind: "page", name: "setup", file: file("src/content/docs/guides/setup.mdx") },
        ],
      },
    ]);
  });

  test("keeps pages outside src/content/docs/ at their full path", () => {
    expect(buildTree([file("README.md")])).toEqual([
      { kind: "page", name: "README", file: file("README.md") },
    ]);
  });
});
