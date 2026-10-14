import { describe, expect, test } from "vite-plus/test";

import { buildTree } from "./page-tree";

const file = (path: string) => ({ path, status: "unchanged" as const, conflict: false });

describe("buildTree", () => {
  test("nests pages by folder under content/, index first and folders last", () => {
    expect(
      buildTree([
        file("content/guides/setup.mdx"),
        file("content/zeta.md"),
        file("content/index.mdx"),
        file("content/guides/index.mdx"),
        file("content/about.mdx"),
      ]),
    ).toEqual([
      { kind: "page", name: "index", file: file("content/index.mdx") },
      { kind: "page", name: "about", file: file("content/about.mdx") },
      { kind: "page", name: "zeta", file: file("content/zeta.md") },
      {
        kind: "folder",
        name: "guides",
        children: [
          { kind: "page", name: "index", file: file("content/guides/index.mdx") },
          { kind: "page", name: "setup", file: file("content/guides/setup.mdx") },
        ],
      },
    ]);
  });

  test("keeps pages outside content/ at their full path", () => {
    expect(buildTree([file("README.md")])).toEqual([
      { kind: "page", name: "README", file: file("README.md") },
    ]);
  });
});
