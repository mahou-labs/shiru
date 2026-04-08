import { createRouterClient } from "@orpc/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import type { RpcContext } from "../utils/context";

const { mockDbThen } = vi.hoisted(() => ({ mockDbThen: vi.fn() }));

vi.mock("@/utils/db", () => {
  const base: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
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

const { mockListReposAccessibleToInstallation, mockGetInstallationOctokit } = vi.hoisted(() => {
  const listRepos = vi.fn();
  return {
    mockListReposAccessibleToInstallation: listRepos,
    mockGetInstallationOctokit: vi.fn(() => ({
      rest: { apps: { listReposAccessibleToInstallation: listRepos } },
    })),
  };
});

vi.mock("@/utils/oktokit", () => ({
  getInstallationOctokit: mockGetInstallationOctokit,
}));

import { createMockContext, createMockSession } from "../test-utils/helpers";
import { githubRouter } from "./github-router";

afterEach(() => vi.clearAllMocks());

type DbRow = { currentPeriodEnd?: Date; createdAt?: Date; [key: string]: unknown };
type DbCallback = (rows: DbRow[]) => unknown;

/**
 * Build a mockDbThen sequence: first call satisfies the requireSubscription
 * middleware, subsequent calls satisfy each handler-level db query in order.
 */
function primeDb(...handlerResponses: DbRow[][]) {
  const responses: DbRow[][] = [
    [{ currentPeriodEnd: new Date(Date.now() + 86400000) }],
    ...handlerResponses,
  ];
  let callCount = 0;
  mockDbThen.mockImplementation((cb: DbCallback) => {
    const rows = responses[callCount] ?? [];
    callCount++;
    return Promise.resolve(cb(rows));
  });
}

function createClient(context: RpcContext) {
  return createRouterClient(githubRouter, { context });
}

describe("githubRouter.getConnection", () => {
  it("throws when session has no activeOrganizationId", async () => {
    const client = createClient(
      createMockContext({ session: createMockSession({ activeOrganizationId: null }) }),
    );

    await expect(client.getConnection()).rejects.toThrow();
  });

  it("returns { connected: false } when no docsSites row exists for the active org", async () => {
    primeDb([]);

    const client = createClient(createMockContext());
    expect(await client.getConnection()).toEqual({ connected: false });
  });

  it("returns the full connection payload when a docsSites row has an installation id", async () => {
    primeDb([
      {
        sourceMode: "github",
        githubOwner: "acme",
        githubOwnerType: "Organization",
        githubRepository: "docs",
        githubInstallationId: 42,
        publishableBranch: "main",
        contentPath: "docs",
      },
    ]);

    const client = createClient(createMockContext());
    expect(await client.getConnection()).toEqual({
      connected: true,
      sourceMode: "github",
      githubOwner: "acme",
      githubOwnerType: "Organization",
      githubRepository: "docs",
      githubInstallationId: 42,
      publishableBranch: "main",
      contentPath: "docs",
    });
  });

  it("reports connected: false when the row exists but githubInstallationId is null", async () => {
    // Verifies the `!!site.githubInstallationId` coercion — the only non-trivial
    // boolean logic in this handler.
    primeDb([
      {
        sourceMode: "managed",
        githubOwner: null,
        githubOwnerType: null,
        githubRepository: null,
        githubInstallationId: null,
        publishableBranch: "main",
        contentPath: "",
      },
    ]);

    const client = createClient(createMockContext());
    const result = await client.getConnection();

    expect(result.connected).toBe(false);
    expect(result).toMatchObject({ sourceMode: "managed", githubInstallationId: null });
  });

  it("propagates db errors when the underlying select rejects", async () => {
    let callCount = 0;
    mockDbThen.mockImplementation((onFulfilled: DbCallback, onRejected?: (e: unknown) => void) => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          onFulfilled([{ currentPeriodEnd: new Date(Date.now() + 86400000) }]),
        );
      }
      onRejected?.(new Error("db down"));
      return undefined;
    });

    const client = createClient(createMockContext());
    await expect(client.getConnection()).rejects.toThrow();
  });
});

describe("githubRouter.listRepos", () => {
  it("throws 'GitHub App not installed' when no docsSites row exists", async () => {
    primeDb([]);

    const client = createClient(createMockContext());
    await expect(client.listRepos()).rejects.toThrow("GitHub App not installed");
  });

  it("throws 'GitHub App not installed' when the row has a null installation id", async () => {
    primeDb([{ githubInstallationId: null }]);

    const client = createClient(createMockContext());
    await expect(client.listRepos()).rejects.toThrow("GitHub App not installed");
  });

  it("returns mapped repositories with snake_case → camelCase rename when octokit succeeds", async () => {
    primeDb([{ githubInstallationId: 99 }]);
    mockListReposAccessibleToInstallation.mockResolvedValue({
      data: {
        repositories: [
          { id: 1, name: "docs", full_name: "acme/docs", default_branch: "main", private: false },
          {
            id: 2,
            name: "internal",
            full_name: "acme/internal",
            default_branch: "develop",
            private: true,
          },
        ],
      },
    });

    const client = createClient(createMockContext());
    expect(await client.listRepos()).toEqual([
      { id: 1, name: "docs", fullName: "acme/docs", defaultBranch: "main", private: false },
      {
        id: 2,
        name: "internal",
        fullName: "acme/internal",
        defaultBranch: "develop",
        private: true,
      },
    ]);
  });

  it("returns an empty array when the installation has no accessible repositories", async () => {
    primeDb([{ githubInstallationId: 99 }]);
    mockListReposAccessibleToInstallation.mockResolvedValue({ data: { repositories: [] } });

    const client = createClient(createMockContext());
    expect(await client.listRepos()).toEqual([]);
  });

  it("coerces a stringified installation id from the db to a number before calling getInstallationOctokit", async () => {
    // Source: `getInstallationOctokit(Number(site.githubInstallationId))`.
    // Prime db with a string to actually exercise the cast — if the cast were
    // removed and the column became text, getInstallationOctokit would receive
    // "99" instead of 99 and break the GitHub App auth flow.
    primeDb([{ githubInstallationId: "99" }]);
    mockListReposAccessibleToInstallation.mockResolvedValue({ data: { repositories: [] } });

    const client = createClient(createMockContext());
    await client.listRepos();

    expect(mockGetInstallationOctokit).toHaveBeenCalledWith(99);
    expect(mockGetInstallationOctokit).not.toHaveBeenCalledWith("99");
  });

  it("propagates octokit errors when listReposAccessibleToInstallation rejects", async () => {
    primeDb([{ githubInstallationId: 99 }]);
    mockListReposAccessibleToInstallation.mockRejectedValue(new Error("GitHub API 403"));

    const client = createClient(createMockContext());
    await expect(client.listRepos()).rejects.toThrow("GitHub API 403");
  });
});

describe("githubRouter.selectRepo", () => {
  it("rejects when repository is an empty string", async () => {
    primeDb();

    const client = createClient(createMockContext());
    await expect(client.selectRepo({ repository: "" })).rejects.toThrow();
  });

  it("rejects when branch is an empty string", async () => {
    // Tests the optional + min(1) Zod combination — branch is optional but
    // must be non-empty if provided.
    primeDb();

    const client = createClient(createMockContext());
    await expect(client.selectRepo({ repository: "docs", branch: "" })).rejects.toThrow();
  });

  it("throws 'GitHub App not installed' when the row has no installation id", async () => {
    primeDb([{ githubInstallationId: null, githubOwner: null }]);

    const client = createClient(createMockContext());
    await expect(client.selectRepo({ repository: "docs" })).rejects.toThrow(
      "GitHub App not installed",
    );
  });

  it("returns { ok: true } on a successful update", async () => {
    primeDb([{ githubInstallationId: 42, githubOwner: "acme" }], []);

    const client = createClient(createMockContext());
    const result = await client.selectRepo({ repository: "docs" });

    expect(result).toEqual({ ok: true });
  });

  it("propagates db errors when the update query rejects", async () => {
    let callCount = 0;
    mockDbThen.mockImplementation((onFulfilled: DbCallback, onRejected?: (e: unknown) => void) => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          onFulfilled([{ currentPeriodEnd: new Date(Date.now() + 86400000) }]),
        );
      }
      if (callCount === 2) {
        return Promise.resolve(onFulfilled([{ githubInstallationId: 42, githubOwner: "acme" }]));
      }
      onRejected?.(new Error("db down"));
      return undefined;
    });

    const client = createClient(createMockContext());
    await expect(client.selectRepo({ repository: "docs" })).rejects.toThrow("db down");
  });
});
