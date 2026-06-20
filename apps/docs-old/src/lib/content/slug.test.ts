import { describe, expect, it } from "vitest";

import { compiledArtifactKey, normalizeSlug, rawMdxKey } from "./slug";

describe("normalizeSlug", () => {
  it("normalizes index and nested MDX paths", () => {
    expect(normalizeSlug("/index.mdx")).toBe("index");
    expect(normalizeSlug("docs/getting-started.mdx")).toBe("docs/getting-started");
    expect(normalizeSlug("//docs//guides/install/")).toBe("docs/guides/install");
  });

  it("rejects traversal and empty paths", () => {
    expect(() => normalizeSlug("../secret.mdx")).toThrow("Invalid document slug");
    expect(() => normalizeSlug("/")).toThrow("Invalid document slug");
  });
});

describe("content keys", () => {
  it("builds stable R2 keys", () => {
    expect(rawMdxKey("site_123", "docs/intro")).toBe("sites/site_123/docs/docs/intro.mdx");
    expect(compiledArtifactKey("site_123", "abc123")).toBe("compiled/site_123/abc123.json");
  });
});
