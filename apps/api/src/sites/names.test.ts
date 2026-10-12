import { describe, expect, it } from "vite-plus/test";

import { LIVE, parseHostname, SiteSlug, TargetLabel, workerName } from "./names";

const domains = { docs: "shiru.sh", preview: "preview.shiru.sh" };

describe("SiteSlug", () => {
  it.each([
    ["acme", true],
    ["acme-docs", true],
    ["a1-b2-c3", true],
    ["a".repeat(40), true],
    ["a".repeat(41), false],
    ["acme--docs", false],
    ["-acme", false],
    ["acme-", false],
    ["Acme", false],
    ["acme.docs", false],
    ["", false],
    ["app", false],
    ["api", false],
    ["docs", false],
    ["preview", false],
    ["t", false],
    ["www", false],
  ])("%j is valid: %s", (input, valid) => {
    expect(SiteSlug.safeParse(input).success).toBe(valid);
  });

  it("names the rule a reserved slug breaks", () => {
    expect(SiteSlug.safeParse("www").error?.issues.map((issue) => issue.message)).toEqual([
      "This address is reserved",
    ]);
  });
});

describe("TargetLabel", () => {
  it.each([
    ["live", true],
    ["draft", true],
    ["pr-12", true],
    ["a".repeat(20), true],
    ["a".repeat(21), false],
    ["pr--12", false],
    ["PR-12", false],
  ])("%j is valid: %s", (input, valid) => {
    expect(TargetLabel.safeParse(input).success).toBe(valid);
  });
});

describe("workerName", () => {
  const acme = SiteSlug.parse("acme");

  it("names the live target after the site", () => {
    expect(workerName(acme, LIVE)).toBe("acme");
  });

  it("puts other targets after the site", () => {
    expect(workerName(acme, TargetLabel.parse("pr-12"))).toBe("acme--pr-12");
    expect(workerName(acme, TargetLabel.parse("draft"))).toBe("acme--draft");
  });
});

describe("parseHostname", () => {
  it.each([
    ["acme.shiru.sh", { kind: "site", slug: "acme" }],
    ["ACME.shiru.sh.", { kind: "site", slug: "acme" }],
    ["pr-12--acme.preview.shiru.sh", { kind: "preview", slug: "acme", label: "pr-12" }],
    ["draft--acme-docs.preview.shiru.sh", { kind: "preview", slug: "acme-docs", label: "draft" }],
    ["docs.acme.com", { kind: "custom", hostname: "docs.acme.com" }],
    ["shiru.sh.evil.com", { kind: "custom", hostname: "shiru.sh.evil.com" }],
    ["notshiru.sh", { kind: "custom", hostname: "notshiru.sh" }],
  ])("parses %s", (host, expected) => {
    expect(parseHostname(host, domains)).toEqual(expected);
  });

  it.each([
    "shiru.sh",
    "www.shiru.sh",
    "app.shiru.sh",
    "preview.shiru.sh",
    "a.b.shiru.sh",
    "pr-12--acme.shiru.sh",
    `${"a".repeat(41)}.shiru.sh`,
    "acme.preview.shiru.sh",
    "live--acme.preview.shiru.sh",
    "pr-12--www.preview.shiru.sh",
    "pr-12--acme--x.preview.shiru.sh",
    "pr---acme.preview.shiru.sh",
    `${"a".repeat(21)}--acme.preview.shiru.sh`,
    "x.pr-12--acme.preview.shiru.sh",
  ])("rejects %s", (host) => {
    expect(parseHostname(host, domains)).toEqual({ kind: "invalid" });
  });
});
