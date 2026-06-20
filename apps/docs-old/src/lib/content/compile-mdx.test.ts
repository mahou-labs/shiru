import { describe, expect, it } from "vitest";

import { compileMdxDocument, hashMdx } from "./compile-mdx";

describe("hashMdx", () => {
  it("returns a stable sha256 hex hash", async () => {
    await expect(hashMdx("# Hello")).resolves.toMatch(/^[a-f0-9]{64}$/);
    await expect(hashMdx("# Hello")).resolves.toBe(await hashMdx("# Hello"));
  });
});

describe("compileMdxDocument", () => {
  it("extracts frontmatter, sanitized html, and headings", async () => {
    const artifact = await compileMdxDocument({
      siteId: "local",
      slug: "docs/intro",
      mdx: "---\ntitle: Intro\ndescription: Start here\norder: 2\n---\n\n## Welcome\n\n<script>alert('xss')</script>\n\nUse `code`.",
    });

    expect(artifact.frontmatter).toEqual({
      title: "Intro",
      description: "Start here",
      order: 2,
    });
    expect(artifact.html).toContain("Welcome");
    expect(artifact.html).not.toContain("script");
    expect(artifact.headings).toEqual([{ id: "welcome", depth: 2, text: "Welcome" }]);
  });

  it("rejects arbitrary MDX JavaScript", async () => {
    await expect(
      compileMdxDocument({
        siteId: "local",
        slug: "bad",
        mdx: "import X from './x'\n\n# Bad",
      }),
    ).rejects.toThrow("MDX imports and exports are not supported");
  });
});
