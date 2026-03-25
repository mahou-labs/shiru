import { createRouterClient } from "@orpc/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const mockAuthApi = vi.hoisted(() => ({
  listOrganizations: vi.fn(),
  setActiveOrganization: vi.fn(),
}));

vi.mock("./auth", () => ({
  auth: { api: mockAuthApi },
}));

const { mockDbThen } = vi.hoisted(() => ({ mockDbThen: vi.fn() }));

vi.mock("./db", () => {
  const base: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };
  const db = new Proxy(base, {
    get(target, prop) {
      if (prop === "then") return mockDbThen;
      if (typeof prop === "string") return target[prop];
    },
  });
  return { db };
});

vi.mock("./logger", () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { log } from "./logger";
import type { RpcContext } from "./context";
import { authedProcedure, protectedProcedure, resolveActiveOrganization } from "./orpc";
import {
  createMockContext,
  createMockSession,
  createMockUser,
  createUnauthenticatedContext,
} from "../test-utils/helpers";

const mockLog = vi.mocked(log);

afterEach(() => {
  vi.clearAllMocks();
});

// Build testable routers using createRouterClient
const authedRouter = { test: authedProcedure.handler(async () => "authed-ok") };
const protectedRouter = { test: protectedProcedure.handler(async () => "protected-ok") };

function createAuthedClient(context: RpcContext) {
  return createRouterClient(authedRouter, { context });
}

function createProtectedClient(context: RpcContext) {
  return createRouterClient(protectedRouter, { context });
}

describe("resolveActiveOrganization", () => {
  it("picks first org and sets active, forwards cookies", async () => {
    mockAuthApi.listOrganizations.mockResolvedValue([
      { id: "org-1", name: "Org 1", slug: "org-1" },
    ]);

    const mockSetCookie = new Headers();
    mockSetCookie.append("set-cookie", "session=abc123");
    mockAuthApi.setActiveOrganization.mockResolvedValue({
      headers: mockSetCookie,
    });

    const resHeaders = new Headers();
    const result = await resolveActiveOrganization(new Headers(), resHeaders);

    expect(result).toBe("org-1");
    expect(mockAuthApi.setActiveOrganization).toHaveBeenCalledWith(
      expect.objectContaining({ body: { organizationId: "org-1" }, returnHeaders: true }),
    );
    expect(resHeaders.getSetCookie()).toContain("session=abc123");
  });

  it("returns null when user has no orgs", async () => {
    mockAuthApi.listOrganizations.mockResolvedValue([]);
    mockAuthApi.setActiveOrganization.mockResolvedValue({
      headers: new Headers(),
    });

    const result = await resolveActiveOrganization(new Headers(), new Headers());
    expect(result).toBeNull();
  });

  it("handles undefined resHeaders gracefully", async () => {
    mockAuthApi.listOrganizations.mockResolvedValue([{ id: "org-1" }]);
    mockAuthApi.setActiveOrganization.mockResolvedValue({
      headers: (() => {
        const h = new Headers();
        h.append("set-cookie", "s=1");
        return h;
      })(),
    });

    // Should not throw
    const result = await resolveActiveOrganization(new Headers(), undefined);
    expect(result).toBe("org-1");
  });
});

describe("requireAuth middleware", () => {
  it("rejects when context.user is null", async () => {
    const client = createAuthedClient(createUnauthenticatedContext());
    await expect(client.test()).rejects.toThrow();
  });

  it("rejects when context.session is null", async () => {
    const client = createAuthedClient(
      createMockContext({
        user: createMockUser(),
        session: undefined,
      }),
    );
    await expect(client.test()).rejects.toThrow();
  });

  it("passes when both user and session are present", async () => {
    const client = createAuthedClient(createMockContext());
    const result = await client.test();
    expect(result).toBe("authed-ok");
  });
});

describe("requireSubscription middleware", () => {
  type DbRow = { currentPeriodEnd?: Date; createdAt?: Date };
  type DbCallback = (rows: DbRow[]) => unknown;

  it("passes when active subscription with future currentPeriodEnd", async () => {
    mockDbThen.mockImplementation((cb: DbCallback) =>
      Promise.resolve(cb([{ currentPeriodEnd: new Date(Date.now() + 86400000) }])),
    );

    const client = createProtectedClient(createMockContext());
    const result = await client.test();
    expect(result).toBe("protected-ok");
  });

  it("passes during trial period when no subscription", async () => {
    let callCount = 0;
    mockDbThen.mockImplementation((cb: DbCallback) => {
      callCount++;
      if (callCount === 1) return Promise.resolve(cb([]));
      return Promise.resolve(cb([{ createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }]));
    });

    const client = createProtectedClient(createMockContext());
    const result = await client.test();
    expect(result).toBe("protected-ok");
  });

  it("rejects with trial_expired when org >= 30 days old and no subscription", async () => {
    let callCount = 0;
    mockDbThen.mockImplementation((cb: DbCallback) => {
      callCount++;
      if (callCount === 1) return Promise.resolve(cb([]));
      return Promise.resolve(cb([{ createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) }]));
    });

    const client = createProtectedClient(createMockContext());
    await expect(client.test()).rejects.toThrow();
  });

  it("rejects with no_active_subscription when subscription expired and trial over", async () => {
    let callCount = 0;
    mockDbThen.mockImplementation((cb: DbCallback) => {
      callCount++;
      if (callCount === 1)
        return Promise.resolve(cb([{ currentPeriodEnd: new Date(Date.now() - 86400000) }]));
      return Promise.resolve(cb([{ createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) }]));
    });

    const client = createProtectedClient(createMockContext());
    await expect(client.test()).rejects.toThrow();
  });

  it("throws NOT_FOUND when no org can be resolved", async () => {
    mockAuthApi.listOrganizations.mockResolvedValue([]);
    mockAuthApi.setActiveOrganization.mockResolvedValue({
      headers: new Headers(),
    });

    const client = createProtectedClient(
      createMockContext({
        session: createMockSession({ activeOrganizationId: null }),
      }),
    );
    await expect(client.test()).rejects.toThrow();
  });

  it("logs error but continues when subscription DB query fails", async () => {
    let callCount = 0;
    mockDbThen.mockImplementation((cb: DbCallback) => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error("DB connection failed"));
      return Promise.resolve(cb([{ createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }]));
    });

    const client = createProtectedClient(createMockContext());
    const result = await client.test();
    expect(result).toBe("protected-ok");
    expect(mockLog.error).toHaveBeenCalledWith(
      "db.subscription_lookup_failed",
      expect.any(Error),
      expect.objectContaining({ organizationId: "org-001" }),
    );
  });

  it("boundary: exactly 30 days means trial_expired (strict <)", async () => {
    let callCount = 0;
    mockDbThen.mockImplementation((cb: DbCallback) => {
      callCount++;
      if (callCount === 1) return Promise.resolve(cb([]));
      return Promise.resolve(cb([{ createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }]));
    });

    const client = createProtectedClient(createMockContext());
    await expect(client.test()).rejects.toThrow();
  });
});
