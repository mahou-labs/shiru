import { describe, expect, test } from "vite-plus/test";

import { isHome, newPagePathError, newPageSource, routeOf, suggestPath, withFile } from "./pages";

const file = (path: string, status: "unchanged" | "added" | "deleted" = "unchanged") => ({
  path,
  status,
  conflict: false,
});

describe("routeOf", () => {
  test("drops content/, the extension and a trailing index", () => {
    expect(routeOf("content/index.mdx")).toBe("/");
    expect(routeOf("content/guides/index.md")).toBe("/guides");
    expect(routeOf("content/guides/setup.mdx")).toBe("/guides/setup");
    expect(routeOf("content/reindex.mdx")).toBe("/reindex");
  });
});

describe("isHome", () => {
  test("is the page at /", () => {
    expect(isHome("content/index.mdx")).toBe(true);
    expect(isHome("content/index.md")).toBe(true);
    expect(isHome("content/guides/index.mdx")).toBe(false);
    expect(isHome("index.mdx")).toBe(false);
  });
});

describe("suggestPath", () => {
  test("slugs the title into the folder as .mdx", () => {
    expect(suggestPath("content/", "Getting Started!")).toBe("content/getting-started.mdx");
    expect(suggestPath("content/guides/", "Déjà vu: API v2")).toBe(
      "content/guides/d-j-vu-api-v2.mdx",
    );
  });

  test("suggests nothing for a title without letters or digits", () => {
    expect(suggestPath("content/", "  ?! ")).toBe("");
  });
});

describe("newPagePathError", () => {
  const files = [
    file("content/index.mdx"),
    file("content/guides/index.mdx"),
    file("content/setup.md"),
    file("content/old.mdx", "deleted"),
    file("docs.config.json"),
  ];

  test("accepts a new page under content/", () => {
    expect(newPagePathError("content/guides/setup.mdx", files)).toBeUndefined();
    expect(newPagePathError("content/notes.md", files)).toBeUndefined();
  });

  test("accepts the path of a page deleted but not published", () => {
    expect(newPagePathError("content/old.mdx", files)).toBeUndefined();
  });

  test("rejects a path that exists", () => {
    expect(newPagePathError("content/setup.md", files)).toBe("content/setup.md already exists");
  });

  test("rejects a path whose URL another page serves", () => {
    expect(newPagePathError("content/setup.mdx", files)).toBe(
      "content/setup.md already serves /setup",
    );
    expect(newPagePathError("content/guides.mdx", files)).toBe(
      "content/guides/index.mdx already serves /guides",
    );
  });

  test("rejects what the API's SitePath rejects", () => {
    expect(newPagePathError("content//a.mdx", files)).toBe(
      "content//a.mdx has an empty, . or .. segment",
    );
    expect(newPagePathError("/content/a.mdx", files)).toBe("/content/a.mdx must be relative");
    expect(newPagePathError("", files)).toBe('"" is empty or too long');
  });

  test("rejects a path outside content/ or without a page extension", () => {
    expect(newPagePathError("guides/a.mdx", files)).toBe("Pages live in content/");
    expect(newPagePathError("content/a.txt", files)).toBe("A page ends in .mdx or .md");
    expect(newPagePathError("content/guides/.mdx", files)).toBe("A page ends in .mdx or .md");
  });
});

describe("newPageSource", () => {
  test("puts the title in front matter as a JSON string", () => {
    expect(newPageSource('Say "hi" <Now>')).toBe('---\ntitle: "Say \\"hi\\" <Now>"\n---\n');
  });
});

describe("withFile", () => {
  test("adds a new page in path order", () => {
    expect(
      withFile([file("content/a.mdx"), file("content/c.mdx")], file("content/b.mdx", "added")),
    ).toEqual([file("content/a.mdx"), file("content/b.mdx", "added"), file("content/c.mdx")]);
  });

  test("replaces the entry of a page saved again", () => {
    expect(withFile([file("content/a.mdx", "deleted")], file("content/a.mdx"))).toEqual([
      file("content/a.mdx"),
    ]);
  });
});
