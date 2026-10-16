import { describe, expect, it } from "vite-plus/test";

import { type Grant, safePath, signGrant, verifyGrant } from "./preview-access";

const SECRET = "preview-secret";
const HOST = "draft--acme.preview.shiru.page";
const NOW = 1_800_000_000_000;
const handoff: Grant = { kind: "handoff", host: HOST, exp: NOW + 60_000 };
const expected = { kind: "handoff", host: HOST, now: NOW, secret: SECRET } as const;

describe("signGrant", () => {
  it("writes the grant and its signature as base64url", async () => {
    const token = await signGrant(handoff, SECRET);
    const [payload, signature] = token.split(".");

    expect(JSON.parse(atob(payload!))).toEqual(handoff);
    expect(signature).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});

describe("verifyGrant", () => {
  it("accepts the grant it was signed for until it expires", async () => {
    const token = await signGrant(handoff, SECRET);

    expect(await verifyGrant(token, expected)).toBe(true);
    expect(await verifyGrant(token, { ...expected, now: NOW + 59_999 })).toBe(true);
    expect(await verifyGrant(token, { ...expected, now: NOW + 60_000 })).toBe(false);
  });

  it("refuses a grant for another host or of another kind", async () => {
    const token = await signGrant(handoff, SECRET);

    expect(await verifyGrant(token, { ...expected, host: "draft--other.preview.shiru.page" })).toBe(
      false,
    );
    expect(await verifyGrant(token, { ...expected, kind: "session" })).toBe(false);
  });

  it("refuses a grant signed with another secret or edited after signing", async () => {
    const [, signature] = (await signGrant(handoff, SECRET)).split(".");
    const forged = btoa(JSON.stringify({ ...handoff, host: "draft--other.preview.shiru.page" }));

    expect(await verifyGrant(await signGrant(handoff, "other-secret"), expected)).toBe(false);
    expect(await verifyGrant(`${forged.replace(/=+$/, "")}.${signature}`, expected)).toBe(false);
  });

  it.each(["", ".", "abc", "a.b.c", "!!!.???", "a.b", `${btoa("not json")}.`])(
    "refuses the malformed token %j",
    async (token) => {
      expect(await verifyGrant(token, expected)).toBe(false);
    },
  );

  it("refuses a validly signed payload that is not a grant", async () => {
    const sign = async (payload: string) => {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
      const base64url = (bytes: Uint8Array) =>
        btoa(String.fromCharCode(...bytes))
          .replaceAll("+", "-")
          .replaceAll("/", "_")
          .replace(/=+$/, "");
      return `${payload}.${base64url(new Uint8Array(signature))}`;
    };

    expect(await verifyGrant(await sign(btoa("not json").replace(/=+$/, "")), expected)).toBe(
      false,
    );
    expect(await verifyGrant(await sign(btoa('{"kind":"handoff"}')), expected)).toBe(false);
  });
});

describe("safePath", () => {
  it.each([
    ["/", "/"],
    ["/guides/setup?tab=npm#install", "/guides/setup?tab=npm#install"],
    [undefined, "/"],
    ["", "/"],
    ["guides", "/"],
    ["//evil.example/x", "/"],
    ["/\\evil.example", "/"],
    ["https://evil.example/", "/"],
  ])("sends %j to %j", (path, expected) => {
    expect(safePath(path)).toBe(expected);
  });
});
