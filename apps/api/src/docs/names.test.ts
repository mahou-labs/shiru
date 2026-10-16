import { describe, expect, it } from "vite-plus/test";

import {
  CustomHostname,
  DocSlug,
  DRAFT,
  hostKey,
  LIVE,
  parseHostname,
  parseWorkerName,
  redirectKey,
  TargetLabel,
  workerName,
} from "./names";

const domains = { docs: "shiru.sh", preview: "preview.shiru.sh" };

describe("DocSlug", () => {
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
    ["cname", false],
    ["docs", false],
    ["preview", false],
    ["t", false],
    ["www", false],
  ])("%j is valid: %s", (input, valid) => {
    expect(DocSlug.safeParse(input).success).toBe(valid);
  });

  it("names the rule a reserved slug breaks", () => {
    expect(DocSlug.safeParse("www").error?.issues.map((issue) => issue.message)).toEqual([
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
  const acme = DocSlug.parse("acme");

  it("names the live target after the doc", () => {
    expect(workerName(acme, LIVE)).toBe("acme");
  });

  it("puts other targets after the doc", () => {
    expect(workerName(acme, TargetLabel.parse("pr-12"))).toBe("acme--pr-12");
    expect(workerName(acme, TargetLabel.parse("draft"))).toBe("acme--draft");
  });
});

describe("parseWorkerName", () => {
  it.each([
    ["acme", { slug: "acme", target: "live" }],
    ["acme--draft", { slug: "acme", target: "draft" }],
    ["acme-docs--pr-12", { slug: "acme-docs", target: "pr-12" }],
  ])("reads %s", (name, expected) => {
    expect(parseWorkerName(name)).toEqual(expected);
  });

  it.each(["acme--live", "www", "www--draft", "acme--draft--x", "acme--", "Acme", ""])(
    "rejects %j",
    (name) => {
      expect(parseWorkerName(name)).toBeNull();
    },
  );

  it("reads back every name workerName gives", () => {
    const acme = DocSlug.parse("acme");
    expect(parseWorkerName(workerName(acme, LIVE))).toEqual({ slug: acme, target: LIVE });
    expect(parseWorkerName(workerName(acme, DRAFT))).toEqual({ slug: acme, target: DRAFT });
  });
});

describe("parseHostname", () => {
  it.each([
    ["acme.shiru.sh", { kind: "doc", slug: "acme" }],
    ["ACME.shiru.sh.", { kind: "doc", slug: "acme" }],
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

describe("CustomHostname", () => {
  it.each([
    ["docs.acme.com", "docs.acme.com"],
    [" Docs.ACME.com. ", "docs.acme.com"],
    ["acme.io", "acme.io"],
    ["help.my-company.co.uk", "help.my-company.co.uk"],
    ["docs.xn--p1ai", "docs.xn--p1ai"],
    [`${"a".repeat(63)}.com`, `${"a".repeat(63)}.com`],
    ["notshiru.page", "notshiru.page"],
    ["Docs.Shiru.SH.", "docs.shiru.sh"],
  ])("accepts %j as %s", (input, hostname) => {
    expect(CustomHostname.parse(input)).toBe(hostname);
  });

  it.each([
    ["localhost", "Enter a domain like docs.example.com"],
    ["not a host", "Enter a domain like docs.example.com"],
    ["192.168.0.1", "Enter a domain like docs.example.com"],
    ["-docs.acme.com", "Enter a domain like docs.example.com"],
    ["docs-.acme.com", "Enter a domain like docs.example.com"],
    ["docs..acme.com", "Enter a domain like docs.example.com"],
    ["docs.acme.c", "Enter a domain like docs.example.com"],
    [`${"a".repeat(64)}.com`, "Enter a domain like docs.example.com"],
    ["https://docs.acme.com", "Enter a domain like docs.example.com"],
    ["docs_acme.com", "Enter a domain like docs.example.com"],
    ["shiru.page", "This domain belongs to Shiru"],
    ["acme.shiru.page", "This domain belongs to Shiru"],
    ["Shiru.SH.", "This domain belongs to Shiru"],
    ["app.shiru.sh", "This domain belongs to Shiru"],
    ["api.shiru.sh", "This domain belongs to Shiru"],
    ["www.shiru.sh", "This domain belongs to Shiru"],
  ])("rejects %j: %s", (input, message) => {
    expect(CustomHostname.safeParse(input).error?.issues.map((issue) => issue.message)).toEqual([
      message,
    ]);
  });

  it("rejects a hostname longer than 253 characters", () => {
    const long = `${Array.from({ length: 4 }, () => "a".repeat(63)).join(".")}.com`;
    expect(CustomHostname.safeParse(long).error?.issues.map((issue) => issue.code)).toEqual([
      "too_big",
    ]);
  });
});

describe("KV keys", () => {
  it("keys a custom hostname and a doc's redirect apart", () => {
    expect(hostKey("docs.acme.com")).toBe("host:docs.acme.com");
    expect(redirectKey(DocSlug.parse("acme"))).toBe("redirect:acme");
  });
});
