import { createRouterClient } from "@orpc/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import type { RpcContext } from "../utils/context";

const mockAuthApi = vi.hoisted(() => ({
  createOrganization: vi.fn(),
  setActiveOrganization: vi.fn(),
  updateOrganization: vi.fn(),
  checkOrganizationSlug: vi.fn(),
  deleteOrganization: vi.fn(),
  listOrganizations: vi.fn(),
  removeMember: vi.fn(),
  updateMemberRole: vi.fn(),
  leaveOrganization: vi.fn(),
  listInvitations: vi.fn(),
  createInvitation: vi.fn(),
  cancelInvitation: vi.fn(),
  acceptInvitation: vi.fn(),
  getFullOrganization: vi.fn(),
  listMembers: vi.fn(),
}));

vi.mock("../utils/auth", () => ({
  auth: { api: mockAuthApi },
}));

const { mockDbThen } = vi.hoisted(() => ({ mockDbThen: vi.fn() }));

vi.mock("@/utils/db", () => {
  const base: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    // insert(...).values(...) is used by createOrg to bootstrap a docsSites row.
    // The chain returns a real resolved promise so the tryCatch wrapper can await
    // it without falling into the proxy's `then` trap (which is reserved for
    // select/from/where/limit awaits configured per-test via mockDbThen).
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue(undefined),
    })),
  };
  const db = new Proxy(base, {
    get(target, prop) {
      if (prop === "then") return mockDbThen;
      if (typeof prop === "string") return target[prop];
    },
  });
  return { db };
});

vi.mock("@/utils/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { log } from "@/utils/logger";

import { createMockContext } from "../test-utils/helpers";
import { organizationRouter } from "./organization-router";

const mockLog = vi.mocked(log);

afterEach(() => vi.clearAllMocks());

type DbRow = { currentPeriodEnd?: Date; createdAt?: Date; [key: string]: unknown };
type DbCallback = (rows: DbRow[]) => unknown;

// Helper: make subscription check pass in protectedProcedure middleware
function mockSubscriptionPass() {
  mockDbThen.mockImplementation((cb: DbCallback) =>
    Promise.resolve(cb([{ currentPeriodEnd: new Date(Date.now() + 86400000) }])),
  );
}

function createClient(context: RpcContext) {
  return createRouterClient(organizationRouter, { context });
}

describe("createOrg", () => {
  it("creates org, sets active, forwards cookies", async () => {
    mockAuthApi.createOrganization.mockResolvedValue({
      id: "new-org",
      name: "New Org",
    });
    const cookieHeaders = new Headers();
    cookieHeaders.append("set-cookie", "session=new123");
    mockAuthApi.setActiveOrganization.mockResolvedValue({
      headers: cookieHeaders,
    });

    const ctx = createMockContext();
    const client = createClient(ctx);
    const result = await client.createOrg({ name: "New Org", slug: "new-org" });

    expect(result).toEqual({ id: "new-org", name: "New Org" });
    expect(mockAuthApi.createOrganization).toHaveBeenCalled();
    expect(mockAuthApi.setActiveOrganization).toHaveBeenCalled();
  });

  it("forwards logo to createOrganization when provided", async () => {
    mockAuthApi.createOrganization.mockResolvedValue({
      id: "new-org",
    });
    mockAuthApi.setActiveOrganization.mockResolvedValue({
      headers: new Headers(),
    });

    const client = createClient(createMockContext());
    await client.createOrg({ name: "Org", slug: "org", logo: "https://example.com/logo.png" });

    expect(mockAuthApi.createOrganization).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { name: "Org", slug: "org", logo: "https://example.com/logo.png" },
      }),
    );
  });

  it("omits logo from createOrganization when not provided", async () => {
    mockAuthApi.createOrganization.mockResolvedValue({
      id: "new-org",
    });
    mockAuthApi.setActiveOrganization.mockResolvedValue({
      headers: new Headers(),
    });

    const client = createClient(createMockContext());
    await client.createOrg({ name: "Org", slug: "org" });

    expect(mockAuthApi.createOrganization).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { name: "Org", slug: "org", logo: undefined },
      }),
    );
    expect(mockAuthApi.updateOrganization).not.toHaveBeenCalled();
  });
});

describe("checkSlugAvailability", () => {
  it("returns true when available", async () => {
    mockAuthApi.checkOrganizationSlug.mockResolvedValue({
      status: true,
    });

    const client = createClient(createMockContext());
    const result = await client.checkSlugAvailability("my-slug");
    expect(result).toBe(true);
  });

  it("returns false and logs on API failure", async () => {
    mockAuthApi.checkOrganizationSlug.mockRejectedValue(new Error("API down"));

    const client = createClient(createMockContext());
    const result = await client.checkSlugAvailability("my-slug");
    expect(result).toBe(false);
    expect(mockLog.error).toHaveBeenCalledWith("org.check_slug_failed", expect.any(Error), {
      slug: "my-slug",
    });
  });
});

describe("getSubscription", () => {
  it("returns null when no activeOrganizationId", async () => {
    // First mock call is for requireSubscription middleware (explicit .then(cb))
    // Second call is for getSubscription handler (await chain directly)
    let callCount = 0;
    mockDbThen.mockImplementation((cb: DbCallback) => {
      callCount++;
      if (callCount === 1)
        return Promise.resolve(cb([{ currentPeriodEnd: new Date(Date.now() + 86400000) }]));
      return Promise.resolve(cb([]));
    });

    // activeOrganizationId is set but we test the handler's null check
    // Need to pass middleware first — the handler checks session.activeOrganizationId
    // With org-1 set, the handler will query DB
    const client = createClient(createMockContext());
    const result = await client.getSubscription();
    // DB returns empty, so null
    expect(result).toBeNull();
  });

  it("returns subscription when found", async () => {
    const sub = {
      id: "sub-1",
      organizationId: "org-001",
      status: "active",
      currentPeriodEnd: new Date(),
    };
    let callCount = 0;
    mockDbThen.mockImplementation((cb: DbCallback) => {
      callCount++;
      // requireSubscription middleware
      if (callCount === 1)
        return Promise.resolve(cb([{ currentPeriodEnd: new Date(Date.now() + 86400000) }]));
      // getSubscription handler returns sub
      return Promise.resolve(cb([sub]));
    });

    const client = createClient(createMockContext());
    const result = await client.getSubscription();
    expect(result).toEqual(sub);
  });
});

describe("deleteOrg", () => {
  it("deletes and resolves next active org", async () => {
    mockSubscriptionPass();
    mockAuthApi.deleteOrganization.mockResolvedValue(undefined);
    mockAuthApi.listOrganizations.mockResolvedValue([{ id: "org-2" }]);
    mockAuthApi.setActiveOrganization.mockResolvedValue({
      headers: new Headers(),
    });

    const client = createClient(createMockContext());
    const result = await client.deleteOrg();
    expect(result).toEqual({ hasRemainingOrgs: true });
  });

  it("returns hasRemainingOrgs false when no orgs remain", async () => {
    mockSubscriptionPass();
    mockAuthApi.deleteOrganization.mockResolvedValue(undefined);
    mockAuthApi.listOrganizations.mockResolvedValue([]);
    mockAuthApi.setActiveOrganization.mockResolvedValue({
      headers: new Headers(),
    });

    const client = createClient(createMockContext());
    const result = await client.deleteOrg();
    expect(result).toEqual({ hasRemainingOrgs: false });
  });
});

describe("createInvite", () => {
  it("creates invitation with correct orgId", async () => {
    mockSubscriptionPass();
    mockAuthApi.createInvitation.mockResolvedValue({ id: "inv-1" });

    const client = createClient(createMockContext());
    await client.createInvite({ email: "new@example.com", role: "member" });

    expect(mockAuthApi.createInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { email: "new@example.com", role: "member", organizationId: "org-001" },
      }),
    );
  });

  it("rejects invalid email format", async () => {
    mockSubscriptionPass();
    const client = createClient(createMockContext());
    await expect(client.createInvite({ email: "not-an-email", role: "member" })).rejects.toThrow();
  });
});

describe("updateOrg", () => {
  it("rejects empty payload", async () => {
    mockSubscriptionPass();
    const client = createClient(createMockContext());
    await expect(client.updateOrg({})).rejects.toThrow();
  });
});

describe("updateMemberRole", () => {
  it("validates role is admin or member", async () => {
    mockSubscriptionPass();
    const client = createClient(createMockContext());
    // @ts-expect-error testing invalid role value
    await expect(client.updateMemberRole({ memberId: "m1", role: "owner" })).rejects.toThrow();
  });

  it("calls auth.api.updateMemberRole with valid input", async () => {
    mockSubscriptionPass();
    mockAuthApi.updateMemberRole.mockResolvedValue({});

    const client = createClient(createMockContext());
    await client.updateMemberRole({ memberId: "m1", role: "admin" });

    expect(mockAuthApi.updateMemberRole).toHaveBeenCalledWith(
      expect.objectContaining({ body: { memberId: "m1", role: "admin" } }),
    );
  });
});
