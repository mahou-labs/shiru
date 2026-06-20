import { describe, expect, it } from "vitest";

import { buildManifest } from "./manifest";
import type { DocMetadata } from "./types";

const baseDoc: Omit<DocMetadata, "id" | "slug" | "title" | "order"> = {
  siteId: "local",
  description: "",
  contentHash: "hash",
  updatedAt: "2026-06-16T00:00:00.000Z",
};

describe("buildManifest", () => {
  it("builds sorted nested sidebar items and page lookup", () => {
    const manifest = buildManifest("local", "v1", [
      { ...baseDoc, id: "2", slug: "guides/install", title: "Install", order: 2 },
      { ...baseDoc, id: "1", slug: "index", title: "Overview", order: 1 },
    ]);

    expect(manifest.siteId).toBe("local");
    expect(manifest.siteVersion).toBe("v1");
    expect(manifest.pages["guides/install"]?.title).toBe("Install");
    expect(manifest.items).toEqual([
      { title: "Overview", href: "/", order: 1, children: [] },
      {
        title: "Guides",
        href: "/guides",
        order: 2,
        children: [{ title: "Install", href: "/guides/install", order: 2, children: [] }],
      },
    ]);
  });
});
