/* oxlint-disable typescript/unbound-method -- vi.mocked/expect patterns in tests reference method properties on mocked objects; the mocks are already detached vi.fn() instances, so `this` binding is not a concern here. */
import { createRouterClient } from "@orpc/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { RpcContext } from "../utils/context";

const { mockDbThen, dbSpies } = vi.hoisted(() => ({
  mockDbThen: vi.fn(),
  dbSpies: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
  },
}));

vi.mock("@/utils/db", () => {
  const db = new Proxy(dbSpies as Record<string, unknown>, {
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

const { mockGetRef, mockGetTree, mockGetBlob, mockGetInstallationOctokit } = vi.hoisted(() => {
  const getRef = vi.fn();
  const getTree = vi.fn();
  const getBlob = vi.fn();
  return {
    mockGetRef: getRef,
    mockGetTree: getTree,
    mockGetBlob: getBlob,
    mockGetInstallationOctokit: vi.fn(() => ({
      rest: { git: { getRef, getTree, getBlob } },
    })),
  };
});

vi.mock("@/utils/oktokit", () => ({
  getInstallationOctokit: mockGetInstallationOctokit,
}));

vi.mock("uuid", () => ({
  v7: vi.fn(() => "test-uuid-v7-instance"),
}));

import { log } from "@/utils/logger";

import { createMockContext, createMockSession } from "../test-utils/helpers";
import {
  docsRouter,
  getGithubFilesAtCommit,
  isWorkflowAlive,
  PublishDocsWorkflow,
  resolveCommitSha,
  validateDocsFilePath,
} from "./docs-router";

const mockLog = vi.mocked(log);

type DbRow = { currentPeriodEnd?: Date; createdAt?: Date; [key: string]: unknown };
type DbCallback = (rows: DbRow[]) => unknown;

/**
 * Build a mockDbThen sequence: first call satisfies the requireSubscription
 * middleware (handler tests), subsequent calls satisfy each handler-level db
 * query in order. For workflow tests that bypass middleware, use primeDbRaw.
 */
function primeDb(...handlerResponses: DbRow[][]) {
  const responses: DbRow[][] = [
    [{ currentPeriodEnd: new Date(Date.now() + 86400000) }],
    ...handlerResponses,
  ];
  let callCount = 0;
  mockDbThen.mockImplementation((onFulfilled: DbCallback) => {
    const rows = responses[callCount] ?? [];
    callCount++;
    return Promise.resolve(onFulfilled(rows));
  });
}

/**
 * Like primeDb but without the subscription-middleware row prepended. Use for
 * direct workflow.run() invocations that don't pass through orpc middleware.
 */
function primeDbRaw(...sequences: Record<string, unknown>[][]) {
  let i = 0;
  mockDbThen.mockImplementation((onFulfilled: DbCallback) => {
    const rows = sequences[i] ?? [];
    i++;
    return Promise.resolve(onFulfilled(rows));
  });
}

function createClient(context: RpcContext) {
  return createRouterClient(docsRouter, { context });
}

afterEach(() => vi.clearAllMocks());

// ============================================================================
// docsRouter handlers
// ============================================================================

describe("docsRouter.getSiteSettings", () => {
  it("throws when session has no activeOrganizationId", async () => {
    const client = createClient(
      createMockContext({ session: createMockSession({ activeOrganizationId: null }) }),
    );

    await expect(client.getSiteSettings()).rejects.toThrow();
  });

  it("throws ORPCError 'Docs site not found' when the db returns no row", async () => {
    primeDb([]);

    const client = createClient(createMockContext());
    await expect(client.getSiteSettings()).rejects.toThrow("Docs site not found");
  });

  it("returns { id, activeCommitSha } from the db row", async () => {
    primeDb([{ id: "site-1", activeCommitSha: "abc123def456" }]);

    const client = createClient(createMockContext());
    expect(await client.getSiteSettings()).toEqual({
      id: "site-1",
      activeCommitSha: "abc123def456",
    });
  });
});

describe("docsRouter.listVersions", () => {
  it("rejects input when limit is 0 (min violation)", async () => {
    primeDb();

    const client = createClient(createMockContext());
    await expect(client.listVersions({ limit: 0 })).rejects.toThrow();
  });

  it("rejects input when limit is 101 (max violation)", async () => {
    primeDb();

    const client = createClient(createMockContext());
    await expect(client.listVersions({ limit: 101 })).rejects.toThrow();
  });

  it("rejects input when limit is a non-integer", async () => {
    primeDb();

    const client = createClient(createMockContext());
    await expect(client.listVersions({ limit: 1.5 })).rejects.toThrow();
  });

  it("accepts the boundary value limit=1", async () => {
    primeDb([{ id: "site-1", activeCommitSha: "abc" }], []);

    const client = createClient(createMockContext());
    expect(await client.listVersions({ limit: 1 })).toEqual({
      activeCommitSha: "abc",
      versions: [],
    });
  });

  it("throws when session has no activeOrganizationId", async () => {
    const client = createClient(
      createMockContext({ session: createMockSession({ activeOrganizationId: null }) }),
    );

    await expect(client.listVersions({ limit: 20 })).rejects.toThrow();
  });

  it("throws ORPCError 'Docs site not found' when the site select returns empty", async () => {
    primeDb([]);

    const client = createClient(createMockContext());
    await expect(client.listVersions({ limit: 20 })).rejects.toThrow("Docs site not found");
  });

  it("returns activeCommitSha and an empty versions list when the site has no versions", async () => {
    primeDb([{ id: "site-1", activeCommitSha: "abc" }], []);

    const client = createClient(createMockContext());
    expect(await client.listVersions({ limit: 20 })).toEqual({
      activeCommitSha: "abc",
      versions: [],
    });
  });

  it("returns activeCommitSha and the version list when both are present", async () => {
    const v1 = {
      id: "v-2",
      versionRef: "sha-newer",
      status: "published" as const,
      createdAt: new Date("2026-04-02"),
    };
    const v2 = {
      id: "v-1",
      versionRef: "sha-older",
      status: "failed" as const,
      createdAt: new Date("2026-04-01"),
    };
    primeDb([{ id: "site-1", activeCommitSha: "sha-newer" }], [v1, v2]);

    const client = createClient(createMockContext());
    expect(await client.listVersions({ limit: 20 })).toEqual({
      activeCommitSha: "sha-newer",
      versions: [v1, v2],
    });
  });
});

describe("docsRouter.publish", () => {
  it("rejects input when docsSiteId is missing", async () => {
    primeDb();

    const client = createClient(createMockContext());
    // @ts-expect-error testing missing required field
    await expect(client.publish({})).rejects.toThrow();
  });

  it("throws when session has no activeOrganizationId", async () => {
    const client = createClient(
      createMockContext({ session: createMockSession({ activeOrganizationId: null }) }),
    );

    await expect(client.publish({ docsSiteId: "site-1" })).rejects.toThrow();
  });

  it("rejects publish for a docsSite that does not belong to the active org (cross-org isolation)", async () => {
    // Active session is for org "org-001". The handler's WHERE clause filters
    // by both `id` AND `organizationId`, so a docsSite owned by a different org
    // returns no rows — same code path as a non-existent site. This test
    // documents the security invariant explicitly.
    primeDb([]);

    const { env } = await import("cloudflare:workers");
    const createSpy = vi.mocked(env.PUBLISH_DOCS.create);

    const client = createClient(createMockContext());
    await expect(client.publish({ docsSiteId: "site-from-other-org" })).rejects.toThrow(
      "Docs site not found",
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("calls PUBLISH_DOCS.create with the resolved payload when ownership passes", async () => {
    primeDb([{ id: "site-1" }]);

    const { env } = await import("cloudflare:workers");
    const createSpy = vi.mocked(env.PUBLISH_DOCS.create);
    createSpy.mockResolvedValueOnce({
      id: "test-uuid-v7-instance",
      status: vi.fn().mockResolvedValue({ status: "queued" }),
    } as never);

    const client = createClient(createMockContext());
    const result = await client.publish({ docsSiteId: "site-1" });

    expect(createSpy).toHaveBeenCalledWith({
      id: "test-uuid-v7-instance",
      params: {
        docsSiteId: "site-1",
        organizationId: "org-001",
        instanceId: "test-uuid-v7-instance",
        requestedByUserId: "user-001",
      },
    });
    expect(result).toEqual({ instanceId: "test-uuid-v7-instance" });
  });

  it("propagates the error when PUBLISH_DOCS.create rejects", async () => {
    primeDb([{ id: "site-1" }]);

    const { env } = await import("cloudflare:workers");
    vi.mocked(env.PUBLISH_DOCS.create).mockRejectedValueOnce(new Error("DO overloaded"));

    const client = createClient(createMockContext());
    await expect(client.publish({ docsSiteId: "site-1" })).rejects.toThrow("DO overloaded");
  });
});

// ============================================================================
// Module-level helpers
// ============================================================================

function buildDocsSite(
  overrides: Partial<{
    githubInstallationId: number | null;
    githubOwner: string | null;
    githubRepository: string | null;
    publishableBranch: string;
    contentPath: string;
  }> = {},
): Parameters<typeof resolveCommitSha>[0] {
  return {
    id: "site-1",
    organizationId: "org-1",
    activeCommitSha: null,
    sourceMode: "github" as const,
    publishableBranch: "main",
    contentPath: "",
    githubOwner: "acme",
    githubOwnerType: "Organization" as const,
    githubRepository: "docs",
    githubInstallationId: 42,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("validateDocsFilePath", () => {
  // Each entry exercises a distinct rejection branch (not just a different
  // character against the same regex). The 8 redundant shell-metachar cases
  // were collapsed into one representative ($), with `space` and `unicode`
  // covering the other meaningful threat classes.
  describe("rejects", () => {
    const rejectCases: [string, string][] = [
      ["empty string", ""],
      ["length > 1024", "a".repeat(1025)],
      ["leading slash", "/foo.md"],
      ["contains backslash", "foo\\bar.md"],
      ["empty segment (a//b)", "a//b"],
      ["dot segment", "a/./b"],
      ["double-dot segment", "a/../b"],
      ["trailing slash", "docs/foo/"],
      ["shell metachar (representative: $)", "docs/$x.md"],
      ["space (most common accidental)", "docs/my file.md"],
      ["unicode (non-ASCII threat)", "docs/café.md"],
    ];

    for (const [name, path] of rejectCases) {
      it(`throws when path is ${name}`, () => {
        expect(() => validateDocsFilePath(path)).toThrow();
      });
    }
  });

  describe("accepts", () => {
    const acceptCases: [string, string][] = [
      ["a single README", "README.md"],
      ["deeply nested", "a/b/c/d.txt"],
      ["a single 1024-char segment", "a".repeat(1024)],
    ];

    for (const [name, path] of acceptCases) {
      it(`does not throw for ${name}`, () => {
        expect(() => validateDocsFilePath(path)).not.toThrow();
      });
    }
  });

  it("includes the offending path in the error message when rejected", () => {
    try {
      validateDocsFilePath("docs/$bad.md");
    } catch (e) {
      expect((e as Error).message).toContain("docs/$bad.md");
      return;
    }
    throw new Error("expected validateDocsFilePath to throw");
  });
});

describe("isWorkflowAlive", () => {
  it("returns true for an alive status (representative: 'queued')", async () => {
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.PUBLISH_DOCS.get).mockResolvedValueOnce({
      status: vi.fn().mockResolvedValue({ status: "queued" }),
    } as never);

    expect(await isWorkflowAlive("inst-1")).toBe(true);
  });

  it("returns false for a dead status (representative: 'complete')", async () => {
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.PUBLISH_DOCS.get).mockResolvedValueOnce({
      status: vi.fn().mockResolvedValue({ status: "complete" }),
    } as never);

    expect(await isWorkflowAlive("inst-1")).toBe(false);
  });

  it("returns false (swallows) when env.PUBLISH_DOCS.get throws", async () => {
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.PUBLISH_DOCS.get).mockRejectedValueOnce(new Error("not found"));

    expect(await isWorkflowAlive("inst-1")).toBe(false);
  });

  it("returns false (swallows) when instance.status() throws", async () => {
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.PUBLISH_DOCS.get).mockResolvedValueOnce({
      status: vi.fn().mockRejectedValue(new Error("api down")),
    } as never);

    expect(await isWorkflowAlive("inst-1")).toBe(false);
  });
});

describe("resolveCommitSha", () => {
  it("throws NonRetryableError when githubInstallationId is missing (compound guard)", async () => {
    await expect(resolveCommitSha(buildDocsSite({ githubInstallationId: null }))).rejects.toThrow(
      "Docs site is not connected to a GitHub repository",
    );
  });

  it("throws NonRetryableError when publishableBranch is an empty string", async () => {
    // Distinct from null check — verifies the guard handles the empty-string case.
    await expect(resolveCommitSha(buildDocsSite({ publishableBranch: "" }))).rejects.toThrow(
      "Docs site is not connected to a GitHub repository",
    );
  });

  it("returns the commit SHA when octokit getRef succeeds", async () => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "abc123" } } });

    expect(await resolveCommitSha(buildDocsSite())).toBe("abc123");
  });

  it("propagates Octokit errors unwrapped (must remain retryable)", async () => {
    // Critical: errors from getRef must NOT be wrapped in NonRetryableError,
    // so the workflow can retry transient GitHub failures.
    mockGetRef.mockRejectedValue(new Error("404 branch not found"));

    await expect(resolveCommitSha(buildDocsSite())).rejects.toThrow("404 branch not found");
  });
});

describe("getGithubFilesAtCommit", () => {
  it("throws NonRetryableError when githubInstallationId is missing", async () => {
    await expect(
      getGithubFilesAtCommit(buildDocsSite({ githubInstallationId: null }), "sha"),
    ).rejects.toThrow("Docs site is not connected to a GitHub repository");
  });

  it("returns an empty array when the recursive tree has zero blobs", async () => {
    mockGetTree.mockResolvedValue({ data: { tree: [] } });

    expect(await getGithubFilesAtCommit(buildDocsSite(), "sha-1")).toEqual([]);
  });

  it("uses the commit SHA directly when contentPath is empty (no traversal)", async () => {
    mockGetTree.mockResolvedValue({ data: { tree: [] } });

    await getGithubFilesAtCommit(buildDocsSite({ contentPath: "" }), "commit-sha");

    expect(mockGetTree).toHaveBeenCalledTimes(1);
  });

  it("walks one level when contentPath is a single segment", async () => {
    mockGetTree
      .mockResolvedValueOnce({
        data: { tree: [{ path: "docs", type: "tree", sha: "tree-sha-docs" }] },
      })
      .mockResolvedValueOnce({ data: { tree: [] } });

    await getGithubFilesAtCommit(buildDocsSite({ contentPath: "docs" }), "commit-sha");

    expect(mockGetTree).toHaveBeenCalledTimes(2);
    expect(mockGetTree).toHaveBeenNthCalledWith(2, {
      owner: "acme",
      repo: "docs",
      tree_sha: "tree-sha-docs",
      recursive: "1",
    });
  });

  it("strips leading and trailing slashes from contentPath before walking", async () => {
    mockGetTree
      .mockResolvedValueOnce({
        data: { tree: [{ path: "docs", type: "tree", sha: "tree-sha" }] },
      })
      .mockResolvedValueOnce({ data: { tree: [] } });

    await getGithubFilesAtCommit(buildDocsSite({ contentPath: "/docs/" }), "commit-sha");

    expect(mockGetTree).toHaveBeenCalledTimes(2);
  });

  it("throws NonRetryableError when an intermediate segment is not found", async () => {
    mockGetTree.mockResolvedValueOnce({
      data: { tree: [{ path: "other", type: "tree", sha: "x" }] },
    });

    await expect(
      getGithubFilesAtCommit(buildDocsSite({ contentPath: "docs" }), "commit-sha"),
    ).rejects.toThrow('Path "docs" not found in repository');
  });

  it("filters out non-blob entries and blobs without sha from the recursive tree", async () => {
    mockGetTree.mockResolvedValue({
      data: {
        tree: [
          { path: "subdir", type: "tree", sha: "t1" },
          { path: "README.md", type: "blob", sha: "b1" },
          { path: "no-sha.md", type: "blob" },
        ],
      },
    });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("hello") } });

    const result = await getGithubFilesAtCommit(buildDocsSite(), "commit-sha");

    expect(result).toHaveLength(1);
    expect(result[0]?.path).toBe("README.md");
  });

  it("decodes base64 blob content into a Uint8Array with exact byte values", async () => {
    mockGetTree.mockResolvedValue({
      data: { tree: [{ path: "hi.txt", type: "blob", sha: "b1" }] },
    });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("Hello") } });

    const result = await getGithubFilesAtCommit(buildDocsSite(), "commit-sha");

    expect(result[0]?.content).toBeInstanceOf(Uint8Array);
    expect(Array.from(result[0]?.content ?? [])).toEqual([72, 101, 108, 108, 111]);
  });

  it("correctly decodes binary content with non-ASCII bytes", async () => {
    // Bytes [0x00, 0xFF, 0x7F, 0x80] — would be mangled by naive string decoding.
    const binary = String.fromCharCode(0, 255, 127, 128);
    mockGetTree.mockResolvedValue({
      data: { tree: [{ path: "binary.bin", type: "blob", sha: "b1" }] },
    });
    mockGetBlob.mockResolvedValue({ data: { content: btoa(binary) } });

    const result = await getGithubFilesAtCommit(buildDocsSite(), "commit-sha");

    expect(Array.from(result[0]?.content ?? [])).toEqual([0, 255, 127, 128]);
  });

  it("returns all files when there are >10 entries (batch boundary)", async () => {
    const entries = Array.from({ length: 25 }, (_, i) => ({
      path: `f${i}.md`,
      type: "blob" as const,
      sha: `sha-${i}`,
    }));
    mockGetTree.mockResolvedValue({ data: { tree: entries } });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("x") } });

    const result = await getGithubFilesAtCommit(buildDocsSite(), "commit-sha");

    expect(result).toHaveLength(25);
    expect(result.every((f) => f.content instanceof Uint8Array)).toBe(true);
  });

  it("propagates errors when a single getBlob call rejects (Promise.all fail-fast)", async () => {
    mockGetTree.mockResolvedValue({
      data: {
        tree: [
          { path: "a.md", type: "blob", sha: "a" },
          { path: "b.md", type: "blob", sha: "b" },
        ],
      },
    });
    mockGetBlob
      .mockResolvedValueOnce({ data: { content: btoa("a") } })
      .mockRejectedValueOnce(new Error("blob 500"));

    await expect(getGithubFilesAtCommit(buildDocsSite(), "commit-sha")).rejects.toThrow("blob 500");
  });

  it("propagates errors when getTree rejects", async () => {
    mockGetTree.mockRejectedValue(new Error("tree 403"));

    await expect(getGithubFilesAtCommit(buildDocsSite(), "commit-sha")).rejects.toThrow("tree 403");
  });
});

// ============================================================================
// PublishDocsWorkflow.run — orchestration + per-step
// ============================================================================

type StepDoFn = (
  name: string,
  optsOrFn: (() => unknown) | { retries?: { limit: number; delay: string; backoff: string } },
  maybeFn?: () => unknown,
) => Promise<unknown>;

function makeFakeStep() {
  const doFn = vi.fn<StepDoFn>(async (_name, optsOrFn, maybeFn) => {
    const fn = typeof optsOrFn === "function" ? optsOrFn : maybeFn;
    return fn ? await fn() : undefined;
  });
  return { do: doFn };
}

const PAYLOAD = {
  docsSiteId: "site-1",
  organizationId: "org-1",
  instanceId: "instance-1",
  requestedByUserId: "user-1",
};

function buildEvent() {
  return {
    payload: PAYLOAD,
    timestamp: new Date(),
    instanceId: "instance-1",
  };
}

const SITE_ROW = {
  id: "site-1",
  organizationId: "org-1",
  activeCommitSha: null,
  sourceMode: "github",
  publishableBranch: "main",
  contentPath: "",
  githubOwner: "acme",
  githubOwnerType: "Organization",
  githubRepository: "docs",
  githubInstallationId: 42,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ORG_ROW = { slug: "acme" };

function instantiate() {
  // The mocked WorkflowEntrypoint base class is empty, so constructor args
  // are unused at runtime. The TypeScript types come from the real Cloudflare
  // module so we cast through unknown to bypass arity checks.
  return new (PublishDocsWorkflow as unknown as new () => InstanceType<
    typeof PublishDocsWorkflow
  >)();
}

async function setupHappyPathSandbox() {
  const { env } = await import("cloudflare:workers");
  const sandbox = {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    exec: vi.fn().mockResolvedValue({
      success: true,
      exitCode: 0,
      stderr: "",
      stdout: JSON.stringify({ files: [] }),
    }),
    destroy: vi.fn().mockResolvedValue(undefined),
  };
  const { getSandbox } = await import("@cloudflare/sandbox");
  vi.mocked(getSandbox).mockReturnValue(sandbox as never);
  vi.mocked(env.DOCS_SOURCE.put).mockResolvedValue(undefined as never);
  vi.mocked(env.DOCS_DIST.put).mockResolvedValue(undefined as never);
  return sandbox;
}

describe("PublishDocsWorkflow.run — orchestration", () => {
  beforeEach(() => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "commit-sha-abc" } } });
    mockGetTree.mockResolvedValue({ data: { tree: [] } });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("x") } });
  });

  it("calls step.do in the expected order on the happy path", async () => {
    primeDbRaw([SITE_ROW], [ORG_ROW], [], [], []);
    await setupHappyPathSandbox();

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await workflow.run(buildEvent(), fakeStep as never);

    expect(fakeStep.do.mock.calls.map((c) => c[0])).toEqual([
      "fetch-site-and-org",
      "resolve-commit-sha",
      "reconcile-version",
      "fetch-github-files",
      "upload-source-to-r2",
      "build-in-sandbox",
      "upload-dist-to-r2",
      "mark-published",
    ]);
  });

  it("short-circuits after reconcile-version when action is 'skip'", async () => {
    primeDbRaw(
      [SITE_ROW],
      [ORG_ROW],
      [{ id: "v-1", status: "published", workflowInstanceId: "other-instance" }],
    );

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await workflow.run(buildEvent(), fakeStep as never);

    expect(fakeStep.do.mock.calls.map((c) => c[0])).toEqual([
      "fetch-site-and-org",
      "resolve-commit-sha",
      "reconcile-version",
    ]);
  });

  it("passes retry options { limit: 2, exponential } to build-in-sandbox", async () => {
    primeDbRaw([SITE_ROW], [ORG_ROW], [], [], []);
    await setupHappyPathSandbox();

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await workflow.run(buildEvent(), fakeStep as never);

    const buildCall = fakeStep.do.mock.calls.find((c) => c[0] === "build-in-sandbox");
    expect(buildCall?.[1]).toEqual({
      retries: { limit: 2, delay: "10 seconds", backoff: "exponential" },
    });
  });

  it("runs mark-failed and cleanup-failed-artifacts when a post-reconcile step throws", async () => {
    primeDbRaw([SITE_ROW], [ORG_ROW], []);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    fakeStep.do.mockImplementation(async (name, optsOrFn, maybeFn) => {
      if (name === "fetch-github-files") throw new Error("fetch failed");
      const fn = typeof optsOrFn === "function" ? optsOrFn : maybeFn;
      return fn ? await fn() : undefined;
    });

    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow("fetch failed");

    const stepNames = fakeStep.do.mock.calls.map((c) => c[0]);
    expect(stepNames).toContain("mark-failed");
    expect(stepNames).toContain("cleanup-failed-artifacts");
  });

  it("runs mark-failed BEFORE cleanup-failed-artifacts (ordering invariant)", async () => {
    // Critical: mark-failed must run first so the row state is updated even
    // if R2 cleanup later fails. Reversing them would mean cleanup-on-failure
    // could leave the row stuck in 'building'.
    primeDbRaw([SITE_ROW], [ORG_ROW], []);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    fakeStep.do.mockImplementation(async (name, optsOrFn, maybeFn) => {
      if (name === "fetch-github-files") throw new Error("fetch failed");
      const fn = typeof optsOrFn === "function" ? optsOrFn : maybeFn;
      return fn ? await fn() : undefined;
    });
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.DOCS_SOURCE.list).mockResolvedValue({
      objects: [],
      truncated: false,
    } as never);
    vi.mocked(env.DOCS_DIST.list).mockResolvedValue({ objects: [], truncated: false } as never);

    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();

    const stepNames = fakeStep.do.mock.calls.map((c) => c[0]);
    const failedIdx = stepNames.indexOf("mark-failed");
    const cleanupIdx = stepNames.indexOf("cleanup-failed-artifacts");
    expect(failedIdx).toBeGreaterThanOrEqual(0);
    expect(cleanupIdx).toBeGreaterThan(failedIdx);
  });

  it("re-throws the original error after cleanup completes", async () => {
    primeDbRaw([SITE_ROW], [ORG_ROW], []);
    const original = new Error("fetch failed");

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    fakeStep.do.mockImplementation(async (name, optsOrFn, maybeFn) => {
      if (name === "fetch-github-files") throw original;
      const fn = typeof optsOrFn === "function" ? optsOrFn : maybeFn;
      return fn ? await fn() : undefined;
    });

    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toBe(original);
  });

  it("does NOT enter the catch block when reconcile-version itself throws", async () => {
    primeDbRaw([SITE_ROW], [ORG_ROW]);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    fakeStep.do.mockImplementation(async (name, optsOrFn, maybeFn) => {
      if (name === "reconcile-version") throw new Error("reconcile blew up");
      const fn = typeof optsOrFn === "function" ? optsOrFn : maybeFn;
      return fn ? await fn() : undefined;
    });

    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow(
      "reconcile blew up",
    );

    const stepNames = fakeStep.do.mock.calls.map((c) => c[0]);
    expect(stepNames).not.toContain("mark-failed");
    expect(stepNames).not.toContain("cleanup-failed-artifacts");
  });
});

describe("PublishDocsWorkflow — fetch-site-and-org step", () => {
  beforeEach(() => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "commit-sha-abc" } } });
    mockGetTree.mockResolvedValue({ data: { tree: [] } });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("x") } });
  });

  it("throws NonRetryableError when the (id, organizationId) pair returns no row (cross-org isolation)", async () => {
    // The site select is filtered by both `id` AND `organizationId`. A workflow
    // payload with a forged organizationId targeting another org's site would
    // return no rows — same code path as a non-existent site. This documents
    // the workflow-layer cross-org guard.
    primeDbRaw([], [ORG_ROW]);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow(
      "Docs site or organization not found",
    );
  });
});

describe("PublishDocsWorkflow — resolve-commit-sha step", () => {
  beforeEach(() => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "commit-sha-abc" } } });
    mockGetTree.mockResolvedValue({ data: { tree: [] } });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("x") } });
  });

  it("propagates NonRetryableError when the GitHub config is incomplete", async () => {
    const incompleteSite = { ...SITE_ROW, githubInstallationId: null };
    primeDbRaw([incompleteSite], [ORG_ROW]);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow(
      "Docs site is not connected to a GitHub repository",
    );
  });
});

describe("PublishDocsWorkflow — reconcile-version step", () => {
  beforeEach(() => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "commit-sha-abc" } } });
    mockGetTree.mockResolvedValue({ data: { tree: [] } });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("x") } });
  });

  it("inserts a new version row with status='building' when no existing row is found", async () => {
    primeDbRaw([SITE_ROW], [ORG_ROW], []);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    fakeStep.do.mockImplementation(async (name, optsOrFn, maybeFn) => {
      if (name === "fetch-github-files") throw new Error("stop here");
      const fn = typeof optsOrFn === "function" ? optsOrFn : maybeFn;
      return fn ? await fn() : undefined;
    });

    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();

    expect(dbSpies.insert).toHaveBeenCalled();
    expect(dbSpies.values).toHaveBeenCalledWith(
      expect.objectContaining({
        docsSiteId: "site-1",
        workflowInstanceId: "instance-1",
        versionRef: "commit-sha-abc",
        status: "building",
      }),
    );
  });

  it("returns 'skip' (no insert/update) when the existing row is already published", async () => {
    primeDbRaw(
      [SITE_ROW],
      [ORG_ROW],
      [{ id: "v-1", status: "published", workflowInstanceId: "other" }],
    );

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await workflow.run(buildEvent(), fakeStep as never);

    expect(dbSpies.update).not.toHaveBeenCalled();
    expect(dbSpies.insert).not.toHaveBeenCalled();
  });

  it("resumes own work without calling isWorkflowAlive when same instanceId", async () => {
    // Optimization: when this workflow IS the owner of the building row, skip
    // the alive check. Catches a regression where the resume short-circuit
    // is removed.
    primeDbRaw(
      [SITE_ROW],
      [ORG_ROW],
      [{ id: "v-1", status: "building", workflowInstanceId: "instance-1" }],
    );

    const { env } = await import("cloudflare:workers");
    const getSpy = vi.mocked(env.PUBLISH_DOCS.get);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    fakeStep.do.mockImplementation(async (name, optsOrFn, maybeFn) => {
      if (name === "fetch-github-files") throw new Error("stop");
      const fn = typeof optsOrFn === "function" ? optsOrFn : maybeFn;
      return fn ? await fn() : undefined;
    });

    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();

    expect(getSpy).not.toHaveBeenCalled();
  });

  it("returns 'skip' without updating when an existing building row is owned by an alive workflow", async () => {
    primeDbRaw(
      [SITE_ROW],
      [ORG_ROW],
      [{ id: "v-1", status: "building", workflowInstanceId: "other-instance" }],
    );

    const { env } = await import("cloudflare:workers");
    vi.mocked(env.PUBLISH_DOCS.get).mockResolvedValue({
      status: vi.fn().mockResolvedValue({ status: "running" }),
    } as never);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await workflow.run(buildEvent(), fakeStep as never);

    expect(dbSpies.update).not.toHaveBeenCalled();
  });

  it("takes over a stale building row by updating ownership only (status stays 'building')", async () => {
    primeDbRaw(
      [SITE_ROW],
      [ORG_ROW],
      [{ id: "v-1", status: "building", workflowInstanceId: "dead-instance" }],
    );

    const { env } = await import("cloudflare:workers");
    vi.mocked(env.PUBLISH_DOCS.get).mockResolvedValue({
      status: vi.fn().mockResolvedValue({ status: "errored" }),
    } as never);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    fakeStep.do.mockImplementation(async (name, optsOrFn, maybeFn) => {
      if (name === "fetch-github-files") throw new Error("stop");
      const fn = typeof optsOrFn === "function" ? optsOrFn : maybeFn;
      return fn ? await fn() : undefined;
    });

    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();

    // The takeover update sets ownership fields but NOT status — verifies the
    // takeover doesn't overwrite the status field by accident.
    const takeoverCall = dbSpies.set.mock.calls
      .map((c) => c[0] as Record<string, unknown>)
      .find((payload) => payload.workflowInstanceId === "instance-1" && !("status" in payload));
    expect(takeoverCall).toBeDefined();
  });

  it("retries a failed row by flipping status back to 'building'", async () => {
    primeDbRaw(
      [SITE_ROW],
      [ORG_ROW],
      [{ id: "v-1", status: "failed", workflowInstanceId: "old-instance" }],
    );

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    fakeStep.do.mockImplementation(async (name, optsOrFn, maybeFn) => {
      if (name === "fetch-github-files") throw new Error("stop");
      const fn = typeof optsOrFn === "function" ? optsOrFn : maybeFn;
      return fn ? await fn() : undefined;
    });

    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();

    const setCalls = dbSpies.set.mock.calls.map((c) => c[0]);
    expect(setCalls).toContainEqual(expect.objectContaining({ status: "building" }));
  });
});

describe("PublishDocsWorkflow — fetch-github-files step", () => {
  beforeEach(() => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "commit-sha-abc" } } });
    mockGetTree.mockResolvedValue({ data: { tree: [] } });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("x") } });
  });

  it("propagates NonRetryableError when validateDocsFilePath rejects a fetched path", async () => {
    primeDbRaw([SITE_ROW], [ORG_ROW], []);

    mockGetTree.mockResolvedValue({
      data: { tree: [{ path: "../escape.md", type: "blob", sha: "b1" }] },
    });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("x") } });

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();
  });
});

describe("PublishDocsWorkflow — upload-source-to-r2 step", () => {
  beforeEach(() => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "commit-sha-abc" } } });
  });

  it("calls DOCS_SOURCE.put with the {slug}/{commitSha}/{path} key for each file", async () => {
    primeDbRaw([SITE_ROW], [ORG_ROW], [], [], []);

    mockGetTree.mockResolvedValue({
      data: {
        tree: [
          { path: "a.md", type: "blob", sha: "sha-a" },
          { path: "b.md", type: "blob", sha: "sha-b" },
        ],
      },
    });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("content") } });
    await setupHappyPathSandbox();

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await workflow.run(buildEvent(), fakeStep as never);

    const { env } = await import("cloudflare:workers");
    expect(env.DOCS_SOURCE.put).toHaveBeenCalledTimes(2);
    expect(env.DOCS_SOURCE.put).toHaveBeenCalledWith(
      "acme/commit-sha-abc/a.md",
      expect.any(Uint8Array),
    );
    expect(env.DOCS_SOURCE.put).toHaveBeenCalledWith(
      "acme/commit-sha-abc/b.md",
      expect.any(Uint8Array),
    );
  });
});

describe("PublishDocsWorkflow — build-in-sandbox step", () => {
  beforeEach(() => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "commit-sha-abc" } } });
    mockGetTree.mockResolvedValue({
      data: { tree: [{ path: "a.md", type: "blob", sha: "sha-a" }] },
    });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("hi") } });
  });

  async function setupForBuild(execResult: {
    success: boolean;
    exitCode: number;
    stderr: string;
    stdout: string;
  }) {
    primeDbRaw([SITE_ROW], [ORG_ROW], [], [], []);

    const sandbox = {
      mkdir: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
      exec: vi.fn().mockResolvedValue(execResult),
      destroy: vi.fn().mockResolvedValue(undefined),
    };
    const { getSandbox } = await import("@cloudflare/sandbox");
    vi.mocked(getSandbox).mockReturnValue(sandbox as never);
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.DOCS_SOURCE.put).mockResolvedValue(undefined as never);
    vi.mocked(env.DOCS_DIST.put).mockResolvedValue(undefined as never);

    return { sandbox, env };
  }

  it("invokes getSandbox with a per-instance name to prevent concurrent-publish collisions", async () => {
    const { env } = await setupForBuild({
      success: true,
      exitCode: 0,
      stderr: "",
      stdout: JSON.stringify({ files: [] }),
    });
    const { getSandbox } = await import("@cloudflare/sandbox");

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await workflow.run(buildEvent(), fakeStep as never);

    expect(getSandbox).toHaveBeenCalledWith(env.BUILDER_SANDBOX, "builder-instance-1");
  });

  it("throws NonRetryableError when the build exits with success: false", async () => {
    // The NonRetryable type matters: it gates the workflow retry budget so
    // deterministic build failures don't burn through retries.
    await setupForBuild({
      success: false,
      exitCode: 1,
      stderr: "Astro compile error",
      stdout: "",
    });

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow(
      "Sandbox build failed",
    );
  });

  it("calls sandbox.destroy() in finally on the success path", async () => {
    const { sandbox } = await setupForBuild({
      success: true,
      exitCode: 0,
      stderr: "",
      stdout: JSON.stringify({ files: [] }),
    });

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await workflow.run(buildEvent(), fakeStep as never);

    expect(sandbox.destroy).toHaveBeenCalledTimes(1);
  });

  it("calls sandbox.destroy() in finally even when the build throws", async () => {
    const { sandbox } = await setupForBuild({
      success: false,
      exitCode: 1,
      stderr: "boom",
      stdout: "",
    });

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();

    expect(sandbox.destroy).toHaveBeenCalledTimes(1);
  });

  it("does NOT propagate destroy() errors when the build succeeded (swallow + log)", async () => {
    const { sandbox } = await setupForBuild({
      success: true,
      exitCode: 0,
      stderr: "",
      stdout: JSON.stringify({ files: [] }),
    });
    sandbox.destroy.mockRejectedValueOnce(new Error("destroy failed"));

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await expect(workflow.run(buildEvent(), fakeStep as never)).resolves.toBeUndefined();
    expect(mockLog.error).toHaveBeenCalledWith(
      "publish.sandbox_destroy_failed",
      expect.objectContaining({ errorMessage: "destroy failed" }),
    );
  });
});

describe("PublishDocsWorkflow — mark-published step", () => {
  beforeEach(() => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "commit-sha-abc" } } });
    mockGetTree.mockResolvedValue({
      data: { tree: [{ path: "a.md", type: "blob", sha: "sha-a" }] },
    });
    mockGetBlob.mockResolvedValue({ data: { content: btoa("hi") } });
  });

  async function setupForPublish(opts: { newest?: { versionRef: string } | null }) {
    // mockDbThen call sequence during a happy-path workflow run:
    //   0: fetch-site-and-org → site select
    //   1: fetch-site-and-org → org select
    //   2: reconcile-version → existing select (empty → insert branch)
    //   3: reconcile-version → insert.values
    //   4: mark-published → update docsVersions (status: published)
    //   5: mark-published → select newest published version
    //   6: mark-published → update docsSites (activeCommitSha) — only if newest
    primeDbRaw([SITE_ROW], [ORG_ROW], [], [], [], opts.newest ? [opts.newest] : [], []);
    await setupHappyPathSandbox();
  }

  it("updates docsVersions.activeCommitSha to the newest published version's ref", async () => {
    await setupForPublish({ newest: { versionRef: "newest-sha" } });

    // Clear the spy AFTER setup so prior workflow steps' set() calls don't
    // pollute the assertion. This scopes the next assertions to mark-published.
    dbSpies.set.mockClear();

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await workflow.run(buildEvent(), fakeStep as never);

    const setCalls = dbSpies.set.mock.calls.map((c) => c[0]);
    expect(setCalls).toContainEqual({ status: "published" });
    expect(setCalls).toContainEqual({ activeCommitSha: "newest-sha" });
  });

  it("does not update docsSites.activeCommitSha when no newest published version is found", async () => {
    await setupForPublish({ newest: null });

    dbSpies.set.mockClear();

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await workflow.run(buildEvent(), fakeStep as never);

    const setCalls = dbSpies.set.mock.calls.map((c) => c[0]);
    expect(setCalls).not.toContainEqual(
      expect.objectContaining({ activeCommitSha: expect.anything() }),
    );
  });
});

describe("PublishDocsWorkflow — mark-failed step", () => {
  beforeEach(() => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "commit-sha-abc" } } });
  });

  it("updates docsVersions to status='failed' when an upstream step throws", async () => {
    primeDbRaw([SITE_ROW], [ORG_ROW], []);
    mockGetTree.mockRejectedValue(new Error("tree fetch failed"));
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.DOCS_SOURCE.list).mockResolvedValue({
      objects: [],
      truncated: false,
    } as never);
    vi.mocked(env.DOCS_DIST.list).mockResolvedValue({ objects: [], truncated: false } as never);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();

    const setCalls = dbSpies.set.mock.calls.map((c) => c[0]);
    expect(setCalls).toContainEqual({ status: "failed" });
  });

  it("stringifies non-Error throws when logging publish.marked_failed", async () => {
    // Tests the `error instanceof Error ? error.message : String(error)` ternary.
    primeDbRaw([SITE_ROW], [ORG_ROW], []);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    fakeStep.do.mockImplementation(async (name, optsOrFn, maybeFn) => {
      if (name === "fetch-github-files") throw "string-error";
      const fn = typeof optsOrFn === "function" ? optsOrFn : maybeFn;
      return fn ? await fn() : undefined;
    });
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.DOCS_SOURCE.list).mockResolvedValue({
      objects: [],
      truncated: false,
    } as never);
    vi.mocked(env.DOCS_DIST.list).mockResolvedValue({ objects: [], truncated: false } as never);

    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toBe("string-error");

    expect(mockLog.error).toHaveBeenCalledWith(
      "publish.marked_failed",
      expect.objectContaining({ errorMessage: "string-error" }),
    );
  });
});

describe("PublishDocsWorkflow — cleanup-failed-artifacts step", () => {
  beforeEach(() => {
    mockGetRef.mockResolvedValue({ data: { object: { sha: "commit-sha-abc" } } });
  });

  async function setupForCleanup() {
    primeDbRaw([SITE_ROW], [ORG_ROW], []);
    mockGetTree.mockRejectedValue(new Error("trigger failure path"));
  }

  it("lists DOCS_SOURCE and DOCS_DIST with the {slug}/{commitSha}/ prefix", async () => {
    await setupForCleanup();
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.DOCS_SOURCE.list).mockResolvedValue({
      objects: [],
      truncated: false,
    } as never);
    vi.mocked(env.DOCS_DIST.list).mockResolvedValue({ objects: [], truncated: false } as never);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();

    expect(env.DOCS_SOURCE.list).toHaveBeenCalledWith({
      prefix: "acme/commit-sha-abc/",
      cursor: undefined,
    });
    expect(env.DOCS_DIST.list).toHaveBeenCalledWith({
      prefix: "acme/commit-sha-abc/",
      cursor: undefined,
    });
  });

  it("calls bucket.delete with the listed object keys when objects exist", async () => {
    await setupForCleanup();
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.DOCS_SOURCE.list).mockResolvedValue({
      objects: [{ key: "acme/commit-sha-abc/a.md" }, { key: "acme/commit-sha-abc/b.md" }],
      truncated: false,
    } as never);
    vi.mocked(env.DOCS_DIST.list).mockResolvedValue({ objects: [], truncated: false } as never);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();

    expect(env.DOCS_SOURCE.delete).toHaveBeenCalledWith([
      "acme/commit-sha-abc/a.md",
      "acme/commit-sha-abc/b.md",
    ]);
  });

  it("skips bucket.delete when the list returns no objects", async () => {
    await setupForCleanup();
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.DOCS_SOURCE.list).mockResolvedValue({
      objects: [],
      truncated: false,
    } as never);
    vi.mocked(env.DOCS_DIST.list).mockResolvedValue({ objects: [], truncated: false } as never);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();
    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow();

    expect(env.DOCS_SOURCE.delete).not.toHaveBeenCalled();
    expect(env.DOCS_DIST.delete).not.toHaveBeenCalled();
  });

  it("does NOT mask the original build error when bucket.list throws (regression for bug #2)", async () => {
    await setupForCleanup();
    const { env } = await import("cloudflare:workers");
    vi.mocked(env.DOCS_SOURCE.list).mockRejectedValue(new Error("R2 list failed"));
    vi.mocked(env.DOCS_DIST.list).mockResolvedValue({ objects: [], truncated: false } as never);

    const workflow = instantiate();
    const fakeStep = makeFakeStep();

    await expect(workflow.run(buildEvent(), fakeStep as never)).rejects.toThrow(
      "trigger failure path",
    );

    expect(mockLog.error).toHaveBeenCalledWith(
      "publish.cleanup_bucket_failed",
      expect.objectContaining({ errorMessage: "R2 list failed" }),
    );
  });
});
