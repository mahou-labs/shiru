import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const { mockOctokitConstructor, mockCreateAppAuth } = vi.hoisted(() => ({
  mockOctokitConstructor: vi.fn(),
  mockCreateAppAuth: vi.fn(() => "create-app-auth-sentinel"),
}));

vi.mock("octokit", () => ({
  Octokit: mockOctokitConstructor,
}));

vi.mock("@octokit/auth-app", () => ({
  createAppAuth: mockCreateAppAuth,
}));

import { getInstallationOctokit, verifyWebhookSignature } from "./oktokit";

afterEach(() => {
  vi.clearAllMocks();
});

// `setup.ts` stubs env.GITHUB_WEBHOOK_SECRET as "whsec_test_secret".
const TEST_SECRET = "whsec_test_secret";

async function signPayload(payload: string, secret = TEST_SECRET): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `sha256=${Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

describe("getInstallationOctokit", () => {
  it("decodes the base64 private key via atob when reading env", () => {
    // env.GITHUB_APP_PRIVATE_KEY is "ZmFrZS1wZW0=" (base64 of "fake-pem").
    // The constructor must receive the decoded plaintext, not the raw base64 —
    // a regression that drops the atob call would silently corrupt the auth key.
    getInstallationOctokit(12345);

    const call = mockOctokitConstructor.mock.calls[0]?.[0] as { auth: { privateKey: string } };
    expect(call.auth.privateKey).toBe("fake-pem");
    expect(call.auth.privateKey).not.toBe("ZmFrZS1wZW0=");
  });
});

describe("verifyWebhookSignature", () => {
  it("returns true when the signature matches a payload signed with the configured secret", async () => {
    const payload = '{"hello":"world"}';
    const signature = await signPayload(payload);

    expect(await verifyWebhookSignature(payload, signature)).toBe(true);
  });

  it("returns false when the signature hex is bit-flipped but the same length", async () => {
    // Exercises the constant-time XOR loop. If someone replaced the loop with a
    // simple `===` it might still pass — but if the loop were removed entirely
    // (always returning true), this test would catch it.
    const payload = '{"hello":"world"}';
    const signature = await signPayload(payload);
    const flipped = signature.slice(0, -1) + (signature.endsWith("0") ? "1" : "0");

    expect(await verifyWebhookSignature(payload, flipped)).toBe(false);
  });

  it("returns false when the signature lacks the sha256= prefix", async () => {
    const payload = '{"hello":"world"}';
    const signature = await signPayload(payload);
    const noPrefix = signature.replace(/^sha256=/, "");

    expect(await verifyWebhookSignature(payload, noPrefix)).toBe(false);
  });

  it("returns false when the signature length differs from the expected length", async () => {
    // Directly tests the early-exit `if (expected.length !== signature.length)`.
    // If the guard were removed the loop could walk past the buffer end.
    expect(await verifyWebhookSignature('{"hello":"world"}', "sha256=deadbeef")).toBe(false);
  });

  it("returns false when the payload differs from the signed payload", async () => {
    const signature = await signPayload('{"a":1}');

    expect(await verifyWebhookSignature('{"a":2}', signature)).toBe(false);
  });

  it("returns true for an empty payload signed with the configured secret", async () => {
    const signature = await signPayload("");

    expect(await verifyWebhookSignature("", signature)).toBe(true);
  });

  it("returns false when the signature contains non-hex characters of the correct length", async () => {
    // Distinct from bit-flip: garbage of correct total length must not pass.
    const fake = `sha256=${"z".repeat(64)}`;

    expect(await verifyWebhookSignature('{"hello":"world"}', fake)).toBe(false);
  });
});
