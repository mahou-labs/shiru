import { createRouterClient } from "@orpc/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const { mockContactsCreate } = vi.hoisted(() => ({ mockContactsCreate: vi.fn() }));

vi.mock("@/utils/email", () => ({
  resend: {
    contacts: { create: mockContactsCreate },
    emails: { send: vi.fn() },
  },
  sendVerificationEmail: vi.fn(),
}));

vi.mock("@/utils/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock("../utils/auth", () => ({
  auth: { api: {} },
}));

import { log } from "@/utils/logger";
import { waitlistRouter } from "./waitlist-router";

const mockLog = vi.mocked(log);

afterEach(() => vi.clearAllMocks());

function createClient() {
  return createRouterClient(waitlistRouter, {
    context: { headers: new Headers(), session: undefined, user: undefined },
  });
}

describe("waitlist.addEmail", () => {
  it("rejects invalid email format", async () => {
    const client = createClient();
    await expect(client.addEmail({ email: "not-an-email" })).rejects.toThrow();
  });

  it("calls resend.contacts.create with correct params", async () => {
    mockContactsCreate.mockResolvedValue({ data: {}, error: null });

    const client = createClient();
    await client.addEmail({ email: "user@example.com" });

    expect(mockContactsCreate).toHaveBeenCalledWith({
      email: "user@example.com",
      segments: [{ id: "5aea1008-77ea-4724-9f15-8ca5cb55516a" }],
    });
  });

  it("returns { success: true } on success", async () => {
    mockContactsCreate.mockResolvedValue({ data: {}, error: null });

    const client = createClient();
    const result = await client.addEmail({ email: "user@example.com" });
    expect(result).toEqual({ success: true });
  });

  it("throws ORPCError on Resend failure", async () => {
    mockContactsCreate.mockResolvedValue({
      data: null,
      error: { message: "Rate limited" },
    });

    const client = createClient();
    await expect(client.addEmail({ email: "user@example.com" })).rejects.toThrow();
  });

  it("logs error with email context on failure", async () => {
    mockContactsCreate.mockResolvedValue({
      data: null,
      error: { message: "Fail" },
    });

    const client = createClient();
    try {
      await client.addEmail({ email: "user@example.com" });
    } catch {
      // expected
    }

    expect(mockLog.error).toHaveBeenCalledWith("waitlist.add_email_failed", expect.anything(), {
      email: "user@example.com",
    });
  });
});
