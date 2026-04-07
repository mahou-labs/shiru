import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("resend", () => ({
  Resend: class Resend {
    public emails: { send: typeof mockSend };
    constructor() {
      this.emails = { send: mockSend };
    }
  },
}));

vi.mock("@/emails/email-verification", () => ({
  default: vi.fn((props: { name: string; verificationLink: string }) => ({
    type: "stub-email-verification",
    props,
  })),
}));

import { sendVerificationEmail } from "./email";

afterEach(() => {
  vi.clearAllMocks();
});

describe("sendVerificationEmail", () => {
  it("propagates the rejection when resend.emails.send rejects with an Error", async () => {
    // The source has no try/catch — confirms a future try/catch wrapper
    // can't silently swallow Resend errors.
    mockSend.mockRejectedValueOnce(new Error("Resend API 422: invalid recipient"));

    await expect(
      sendVerificationEmail({ to: "a@b.c", name: "X", verificationLink: "https://x" }),
    ).rejects.toThrow("Resend API 422: invalid recipient");
  });

  it("propagates a non-Error rejection value verbatim when Resend rejects with a plain object", async () => {
    // Distinct from the Error case: catches a regression that wraps non-Error
    // rejections in a new Error, which would lose the original payload.
    const rejectionValue = { statusCode: 500, body: "boom" };
    mockSend.mockRejectedValueOnce(rejectionValue);

    await expect(
      sendVerificationEmail({ to: "a@b.c", name: "X", verificationLink: "https://x" }),
    ).rejects.toBe(rejectionValue);
  });
});
