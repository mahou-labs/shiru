import { describe, expect, test } from "vite-plus/test";

import {
  flavorOf,
  isHome,
  newPagePathError,
  newPageSource,
  routeOf,
  suggestPath,
  withFile,
} from "./pages";

const file = (path: string, status: "unchanged" | "added" | "deleted" = "unchanged") => ({
  path,
  status,
  conflict: false,
});

describe("routeOf", () => {
  test("drops src/content/docs/, the extension and a trailing index", () => {
    expect(routeOf("src/content/docs/index.mdx")).toBe("/");
    expect(routeOf("src/content/docs/guides/index.md")).toBe("/guides");
    expect(routeOf("src/content/docs/guides/setup.mdx")).toBe("/guides/setup");
    expect(routeOf("src/content/docs/reindex.mdx")).toBe("/reindex");
  });
});

describe("isHome", () => {
  test("is the page at /", () => {
    expect(isHome("src/content/docs/index.mdx")).toBe(true);
    expect(isHome("src/content/docs/index.md")).toBe(true);
    expect(isHome("src/content/docs/guides/index.mdx")).toBe(false);
    expect(isHome("index.mdx")).toBe(false);
  });
});

describe("suggestPath", () => {
  test("slugs the title into the folder as .mdx", () => {
    expect(suggestPath("src/content/docs/", "Getting Started!")).toBe(
      "src/content/docs/getting-started.mdx",
    );
    expect(suggestPath("src/content/docs/guides/", "Déjà vu: API v2")).toBe(
      "src/content/docs/guides/d-j-vu-api-v2.mdx",
    );
  });

  test("suggests nothing for a title without letters or digits", () => {
    expect(suggestPath("src/content/docs/", "  ?! ")).toBe("");
  });
});

describe("newPagePathError", () => {
  const files = [
    file("src/content/docs/index.mdx"),
    file("src/content/docs/guides/index.mdx"),
    file("src/content/docs/setup.md"),
    file("src/content/docs/old.mdx", "deleted"),
    file("docs.config.json"),
  ];

  test("accepts a new page under src/content/docs/", () => {
    expect(newPagePathError("src/content/docs/guides/setup.mdx", files)).toBeUndefined();
    expect(newPagePathError("src/content/docs/notes.md", files)).toBeUndefined();
  });

  test("accepts the path of a page deleted but not published", () => {
    expect(newPagePathError("src/content/docs/old.mdx", files)).toBeUndefined();
  });

  test("rejects a path that exists", () => {
    expect(newPagePathError("src/content/docs/setup.md", files)).toBe(
      "src/content/docs/setup.md already exists",
    );
  });

  test("rejects a path whose URL another page serves", () => {
    expect(newPagePathError("src/content/docs/setup.mdx", files)).toBe(
      "src/content/docs/setup.md already serves /setup",
    );
    expect(newPagePathError("src/content/docs/guides.mdx", files)).toBe(
      "src/content/docs/guides/index.mdx already serves /guides",
    );
  });

  test("rejects what the API's DocPath rejects", () => {
    expect(newPagePathError("src/content/docs//a.mdx", files)).toBe(
      "src/content/docs//a.mdx has an empty, . or .. segment",
    );
    expect(newPagePathError("/src/content/docs/a.mdx", files)).toBe(
      "/src/content/docs/a.mdx must be relative",
    );
    expect(newPagePathError("", files)).toBe('"" is empty or too long');
  });

  test("rejects a path outside src/content/docs/ or without a page extension", () => {
    expect(newPagePathError("guides/a.mdx", files)).toBe("Pages live in src/content/docs/");
    expect(newPagePathError("src/content/docs/a.txt", files)).toBe("A page ends in .mdx or .md");
    expect(newPagePathError("src/content/docs/guides/.mdx", files)).toBe(
      "A page ends in .mdx or .md",
    );
  });
});

describe("newPageSource", () => {
  test("puts the title in front matter as a JSON string", () => {
    expect(newPageSource('Say "hi" <Now>')).toBe('---\ntitle: "Say \\"hi\\" <Now>"\n---\n\n');
  });
});

describe("withFile", () => {
  test("adds a new page in path order", () => {
    expect(
      withFile(
        [file("src/content/docs/a.mdx"), file("src/content/docs/c.mdx")],
        file("src/content/docs/b.mdx", "added"),
      ),
    ).toEqual([
      file("src/content/docs/a.mdx"),
      file("src/content/docs/b.mdx", "added"),
      file("src/content/docs/c.mdx"),
    ]);
  });

  test("replaces the entry of a page saved again", () => {
    expect(
      withFile([file("src/content/docs/a.mdx", "deleted")], file("src/content/docs/a.mdx")),
    ).toEqual([file("src/content/docs/a.mdx")]);
  });
});

describe("flavorOf", () => {
  test("maps page extensions to flavors", () => {
    expect(flavorOf("docs/src/content/docs/index.mdx")).toBe("mdx");
    expect(flavorOf("docs/src/content/docs/guide.md")).toBe("md");
    expect(flavorOf("docs/src/content/docs/data.json")).toBe(null);
  });
});
