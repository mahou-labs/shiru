import { describe, expect, it } from "vite-plus/test";

import { SiteSource } from "./source";

describe("SiteSource", () => {
  it("parses a connected GitHub source", () => {
    const github = {
      kind: "github",
      installationId: 42,
      repo: "acme/acme",
      branch: "main",
      docsRoot: "docs/",
      editorWrites: "pull_request",
    };
    expect(SiteSource.parse(github)).toEqual(github);
  });

  it.each([
    { kind: "gitlab", artifactsRepo: "x" },
    { kind: "managed" },
    {
      kind: "github",
      installationId: 42,
      repo: "acme/acme",
      branch: "main",
      docsRoot: "docs/",
      editorWrites: "merge",
    },
  ])("rejects %j", (source) => {
    expect(SiteSource.safeParse(source).success).toBe(false);
  });
});
