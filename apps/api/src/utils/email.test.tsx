import { afterEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("@react-email/components", () => ({
  render: vi.fn((_element, opts?) => Promise.resolve(opts?.plainText ? "text-body" : "html-body")),
}));

vi.mock("@/emails/email-verification", () => ({
  default: vi.fn((props: { name: string; verificationLink: string }) => ({
    type: "stub-email-verification",
    props,
  })),
}));

import { env } from "cloudflare:workers";
import { sendVerificationEmail } from "./email";

const mockSend = vi.mocked(env.EMAIL.send);

afterEach(() => {
  vi.clearAllMocks();
});

describe("sendVerificationEmail", () => {
  it("propagates the rejection when env.EMAIL.send rejects with an Error", async () => {
    mockSend.mockRejectedValueOnce(new Error("Cloudflare Email API 422: invalid recipient"));

    await expect(
      sendVerificationEmail({ to: "a@b.c", name: "X", verificationLink: "https://x" }),
    ).rejects.toThrow("Cloudflare Email API 422: invalid recipient");
  });

  it("propagates a non-Error rejection value verbatim when env.EMAIL.send rejects with a plain object", async () => {
    const rejectionValue = { statusCode: 500, body: "boom" };
    mockSend.mockRejectedValueOnce(rejectionValue);

    await expect(
      sendVerificationEmail({ to: "a@b.c", name: "X", verificationLink: "https://x" }),
    ).rejects.toBe(rejectionValue);
  });
});
