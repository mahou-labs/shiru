/* oxlint-disable typescript/unbound-method -- test assertions intentionally inspect vi.fn method mocks on env stubs. */
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

const { mockDbThen, insertValues } = vi.hoisted(() => ({
  mockDbThen: vi.fn(),
  insertValues: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/utils/db", () => {
  const base: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    // insert(...).values(...) is used by createOrg to bootstrap a docsSites row.
    // The chain returns a real resolved promise so the tryCatch wrapper can await
    // it without falling into the proxy's `then` trap (which is reserved for
    // select/from/where/limit awaits configured per-test via mockDbThen).
    insert: vi.fn(() => ({
      values: insertValues,
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

// Helper: prime mockDbThen for handler-level db queries in order
function mockDbSequence(...handlerResponses: DbRow[][]) {
  let callCount = 0;
  mockDbThen.mockImplementation((cb: DbCallback) => {
    const rows = handlerResponses[callCount] ?? [];
    callCount++;
    return Promise.resolve(cb(rows));
  });
}

function createClient(context: RpcContext) {
  return createRouterClient(organizationRouter, { context });
}

describe("createOrg", () => {
  it.each(["Bad", "bad_slug", "-bad", "bad-", "bad.slug", "bad slug", "app", "api", "docs", "t", "www"])(
    "rejects unavailable Site Subdomain %s before creating an organization",
    async (slug) => {
      const client = createClient(createMockContext());

      await expect(client.createOrg({ name: "Org", slug })).rejects.toThrow();
      expect(mockAuthApi.createOrganization).not.toHaveBeenCalled();
    },
  );

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
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "new-org", storagePrefix: "new-org" }),
    );
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

  it.each(["Bad", "bad_slug", "-bad", "bad-", "bad.slug", "bad slug", "app", "api", "docs", "t", "www"])(
    "returns false for unavailable Site Subdomain %s without calling Better Auth",
    async (slug) => {
      const client = createClient(createMockContext());

      await expect(client.checkSlugAvailability(slug)).resolves.toBe(false);
      expect(mockAuthApi.checkOrganizationSlug).not.toHaveBeenCalled();
    },
  );
});

describe("getSubscription", () => {
  it("returns null when no subscription found", async () => {
    mockDbThen.mockImplementation((cb: DbCallback) => Promise.resolve(cb([])));

    const client = createClient(createMockContext());
    const result = await client.getSubscription();
    expect(result).toBeNull();
  });

  it("returns subscription when found", async () => {
    const sub = {
      id: "sub-1",
      organizationId: "org-001",
      status: "active",
      currentPeriodEnd: new Date(),
    };
    mockDbThen.mockImplementation((cb: DbCallback) => Promise.resolve(cb([sub])));

    const client = createClient(createMockContext());
    const result = await client.getSubscription();
    expect(result).toEqual(sub);
  });
});

describe("deleteOrg", () => {
  it("deletes and resolves next active org", async () => {
    mockDbSequence([{ slug: "org-1" }]);
    mockAuthApi.deleteOrganization.mockResolvedValue(undefined);
    mockAuthApi.listOrganizations.mockResolvedValue([{ id: "org-2" }]);
    mockAuthApi.setActiveOrganization.mockResolvedValue({
      headers: new Headers(),
    });

    const client = createClient(createMockContext());
    const result = await client.deleteOrg();
    expect(result).toEqual({ hasRemainingOrgs: true });

    const { env } = await import("cloudflare:workers");
    expect(env.DOCS_KV.delete).toHaveBeenCalledWith("docs:site:org-1");
  });

  it("returns hasRemainingOrgs false when no orgs remain", async () => {
    mockDbSequence([{ slug: "org-1" }]);
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
    mockDbSequence();
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
    mockDbSequence();
    const client = createClient(createMockContext());
    await expect(client.createInvite({ email: "not-an-email", role: "member" })).rejects.toThrow();
  });
});

describe("updateOrg", () => {
  it("rejects empty payload", async () => {
    mockDbSequence();
    const client = createClient(createMockContext());
    await expect(client.updateOrg({})).rejects.toThrow();
  });

  it.each(["Bad", "bad_slug", "-bad", "bad-", "bad.slug", "bad slug", "app", "api", "docs", "t", "www"])(
    "rejects unavailable Site Subdomain %s before renaming an organization",
    async (slug) => {
      const client = createClient(createMockContext());

      await expect(client.updateOrg({ slug })).rejects.toThrow();
      expect(mockAuthApi.updateOrganization).not.toHaveBeenCalled();
    },
  );

  it("refreshes DOCS_KV when the organization slug changes", async () => {
    mockDbSequence(
      [{ slug: "old-org" }],
      [{ activeCommitSha: "sha-live", storagePrefix: "docs-old-org" }],
    );
    mockAuthApi.updateOrganization.mockResolvedValue({ id: "org-001", slug: "new-org" });

    const client = createClient(createMockContext());
    await client.updateOrg({ slug: "new-org" });

    const { env } = await import("cloudflare:workers");
    expect(env.DOCS_KV.delete).toHaveBeenCalledWith("docs:site:old-org");
    expect(env.DOCS_KV.put).toHaveBeenCalledWith(
      "docs:site:new-org",
      JSON.stringify({
        activeCommitSha: "sha-live",
        storagePrefix: "docs-old-org",
      }),
    );
  });

  it("repairs a placeholder storagePrefix before warming DOCS_KV for the new slug", async () => {
    mockDbSequence(
      [{ slug: "old-org" }],
      [{ activeCommitSha: "sha-live", storagePrefix: "storage_prefix" }],
      [],
    );
    mockAuthApi.updateOrganization.mockResolvedValue({ id: "org-001", slug: "new-org" });

    const client = createClient(createMockContext());
    await client.updateOrg({ slug: "new-org" });

    const { env } = await import("cloudflare:workers");
    expect(env.DOCS_KV.put).toHaveBeenCalledWith(
      "docs:site:new-org",
      JSON.stringify({
        activeCommitSha: "sha-live",
        storagePrefix: "old-org",
      }),
    );
  });
});

describe("updateMemberRole", () => {
  it("validates role is admin or member", async () => {
    mockDbSequence();
    const client = createClient(createMockContext());
    // @ts-expect-error testing invalid role value
    await expect(client.updateMemberRole({ memberId: "m1", role: "owner" })).rejects.toThrow();
  });

  it("calls auth.api.updateMemberRole with valid input", async () => {
    mockDbSequence();
    mockAuthApi.updateMemberRole.mockResolvedValue({});

    const client = createClient(createMockContext());
    await client.updateMemberRole({ memberId: "m1", role: "admin" });

    expect(mockAuthApi.updateMemberRole).toHaveBeenCalledWith(
      expect.objectContaining({ body: { memberId: "m1", role: "admin" } }),
    );
  });
});
