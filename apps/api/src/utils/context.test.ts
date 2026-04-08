import { describe, expect, it, vi } from "vite-plus/test";

const mockGetSession = vi.hoisted(() => vi.fn());

vi.mock("./auth", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

import type { CreateContextInput } from "./context";
import { createContext } from "./context";

function makeMockHonoContext(headers: Headers = new Headers()): CreateContextInput {
  return {
    req: { raw: { headers } },
  };
}

describe("createContext", () => {
  it("returns session and user when auth headers present", async () => {
    const session = { id: "s1", userId: "u1" };
    const user = { id: "u1", name: "Test" };
    mockGetSession.mockResolvedValue({ session, user });

    const result = await createContext(makeMockHonoContext());
    expect(result.session).toEqual(session);
    expect(result.user).toEqual(user);
    expect(result.headers).toBeInstanceOf(Headers);
  });

  it("returns undefined session/user when no auth headers", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await createContext(makeMockHonoContext());
    expect(result.session).toBeUndefined();
    expect(result.user).toBeUndefined();
  });

  it("passes headers to auth.api.getSession", async () => {
    mockGetSession.mockResolvedValue(null);
    const headers = new Headers({ Authorization: "Bearer token123" });

    await createContext(makeMockHonoContext(headers));
    expect(mockGetSession).toHaveBeenCalledWith({ headers });
  });
});
