import { createRouterClient } from "@orpc/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("@/utils/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock("../utils/auth", () => ({
  auth: { api: {} },
}));

const { insertValues } = vi.hoisted(() => ({
  insertValues: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/utils/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: insertValues,
    })),
  },
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

  it("inserts email into waitlist and returns { success: true }", async () => {
    insertValues.mockResolvedValueOnce(undefined);

    const client = createClient();
    const result = await client.addEmail({ email: "user@example.com" });
    expect(result).toEqual({ success: true });
  });

  it("throws ORPCError on database failure", async () => {
    insertValues.mockRejectedValueOnce(new Error("DB error"));

    const client = createClient();
    await expect(client.addEmail({ email: "user@example.com" })).rejects.toThrow();
  });

  it("logs error with email context on failure", async () => {
    insertValues.mockRejectedValueOnce(new Error("DB error"));

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
