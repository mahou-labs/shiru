import { createRouterClient } from "@orpc/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const mockGetSession = vi.hoisted(() => vi.fn());

vi.mock("../utils/auth", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

import { userRouter } from "./user-router";

afterEach(() => vi.clearAllMocks());

function createClient(
  context: Partial<{ headers: Headers; session: undefined; user: undefined }> = {},
) {
  return createRouterClient(userRouter, {
    context: { headers: new Headers(), session: undefined, user: undefined, ...context },
  });
}

describe("user.getSession", () => {
  it("returns session when authenticated", async () => {
    const session = { id: "s1", userId: "u1" };
    const user = { id: "u1", name: "Test" };
    mockGetSession.mockResolvedValue({ session, user });

    const client = createClient();
    const result = await client.getSession();
    expect(result).toEqual({ session, user });
  });

  it("returns null when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const client = createClient();
    const result = await client.getSession();
    expect(result).toBeNull();
  });

  it("passes disableCookieCache: true", async () => {
    mockGetSession.mockResolvedValue(null);

    const client = createClient();
    await client.getSession();

    expect(mockGetSession).toHaveBeenCalledWith(
      expect.objectContaining({ query: { disableCookieCache: true } }),
    );
  });
});
