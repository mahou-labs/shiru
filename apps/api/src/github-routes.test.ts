import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const { mockDbThen, dbSpies } = vi.hoisted(() => ({
  mockDbThen: vi.fn(),
  dbSpies: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
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

const { mockVerifyWebhookSignature, mockGetInstallationOctokit, mockGetInstallation } = vi.hoisted(
  () => {
    const getInstallation = vi.fn();
    return {
      mockVerifyWebhookSignature: vi.fn(),
      mockGetInstallation: getInstallation,
      mockGetInstallationOctokit: vi.fn(() => ({
        rest: { apps: { getInstallation } },
      })),
    };
  },
);

vi.mock("@/utils/oktokit", () => ({
  verifyWebhookSignature: mockVerifyWebhookSignature,
  getInstallationOctokit: mockGetInstallationOctokit,
}));

const { mockGetSession } = vi.hoisted(() => ({ mockGetSession: vi.fn() }));

vi.mock("@/utils/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock("@/utils/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock("uuid", () => ({
  v7: vi.fn(() => "test-uuid-v7-abc"),
}));

import { log } from "@/utils/logger";

import { githubRoutes } from "./github-routes";

const mockLog = vi.mocked(log);

afterEach(() => {
  vi.clearAllMocks();
  mockDbThen.mockReset();
  // The proxy spies have `mockReturnThis` baked in via the hoisted definition;
  // clearAllMocks above resets *call history* but does not strip
  // implementations, so the chainable behavior survives. Reset history only.
});

type DbCallback = (rows: Record<string, unknown>[]) => unknown;

/**
 * Configure mockDbThen to return a sequence of resolved row arrays — one per
 * awaited db chain in the handler. Index 0 → first await, index 1 → second
 * await, etc. Used for happy paths.
 */
function primeDbResolves(...sequences: Record<string, unknown>[][]) {
  let callCount = 0;
  mockDbThen.mockImplementation((onFulfilled: DbCallback) => {
    const rows = sequences[callCount] ?? [];
    callCount++;
    return Promise.resolve(onFulfilled(rows));
  });
}

function buildWebhookRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request("http://test.local/webhook", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });
}

describe("POST /webhook — signature gate", () => {
  it("returns 401 'Invalid signature' when the x-hub-signature-256 header is missing", async () => {
    const res = await githubRoutes.request(buildWebhookRequest("{}"));

    expect(res.status).toBe(401);
    expect(await res.text()).toBe("Invalid signature");
    expect(mockVerifyWebhookSignature).not.toHaveBeenCalled();
  });

  it("returns 401 'Invalid signature' when verifyWebhookSignature returns false", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(false);

    const res = await githubRoutes.request(
      buildWebhookRequest("{}", { "x-hub-signature-256": "sha256=bad" }),
    );

    expect(res.status).toBe(401);
  });

  it("does not call db when the signature is invalid", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(false);

    await githubRoutes.request(buildWebhookRequest("{}", { "x-hub-signature-256": "sha256=bad" }));

    expect(dbSpies.select).not.toHaveBeenCalled();
    expect(dbSpies.update).not.toHaveBeenCalled();
  });

  it("returns 200 with { ok: true } when the signature is valid and the event is unhandled", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);

    const res = await githubRoutes.request(
      buildWebhookRequest("{}", {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "ping",
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns 400 'Invalid payload' when the body is malformed JSON (regression for bug #4)", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);

    const res = await githubRoutes.request(
      buildWebhookRequest("not-json", {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "push",
      }),
    );

    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid payload");
  });
});

describe("POST /webhook — installation.deleted", () => {
  it("issues a single docsSites update when an installation.deleted event arrives", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);
    primeDbResolves([]);

    const body = JSON.stringify({ action: "deleted", installation: { id: 777 } });
    const res = await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "installation",
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(dbSpies.update).toHaveBeenCalledTimes(1);
  });

  it("returns ok and skips the db update when the installation id is missing", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);

    const body = JSON.stringify({ action: "deleted", installation: {} });
    const res = await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "installation",
      }),
    );

    expect(res.status).toBe(200);
    expect(dbSpies.update).not.toHaveBeenCalled();
  });

  it("returns ok and skips the db update when the installation id is zero", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);

    const body = JSON.stringify({ action: "deleted", installation: { id: 0 } });
    await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "installation",
      }),
    );

    expect(dbSpies.update).not.toHaveBeenCalled();
  });

  it("returns ok and skips the db update when the installation id is non-numeric", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);

    const body = JSON.stringify({ action: "deleted", installation: { id: "not-a-number" } });
    await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "installation",
      }),
    );

    expect(dbSpies.update).not.toHaveBeenCalled();
  });

  it("returns ok and skips the db update when the action is not 'deleted'", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);

    const body = JSON.stringify({ action: "created", installation: { id: 777 } });
    await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "installation",
      }),
    );

    expect(dbSpies.update).not.toHaveBeenCalled();
  });
});

describe("POST /webhook — push", () => {
  it("logs github.push_matched when the ref matches the site's publishableBranch", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);
    primeDbResolves([{ id: "site-1", githubInstallationId: 42, publishableBranch: "main" }]);

    const body = JSON.stringify({ installation: { id: 42 }, ref: "refs/heads/main" });
    await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "push",
      }),
    );

    expect(mockLog.info).toHaveBeenCalledWith("github.push_matched", {
      installationId: 42,
      branch: "main",
      docsSiteId: "site-1",
    });
  });

  it("does not log push_matched when the ref branch differs from publishableBranch", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);
    primeDbResolves([{ id: "site-1", githubInstallationId: 42, publishableBranch: "main" }]);

    const body = JSON.stringify({ installation: { id: 42 }, ref: "refs/heads/feature-x" });
    await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "push",
      }),
    );

    expect(mockLog.info).not.toHaveBeenCalledWith("github.push_matched", expect.anything());
  });

  it("does not log push_matched when no docs site is found for the installation id", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);
    primeDbResolves([]);

    const body = JSON.stringify({ installation: { id: 42 }, ref: "refs/heads/main" });
    await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "push",
      }),
    );

    expect(mockLog.info).not.toHaveBeenCalledWith("github.push_matched", expect.anything());
  });

  it("returns ok and skips processing when installation id is missing", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);

    const body = JSON.stringify({ ref: "refs/heads/main" });
    const res = await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "push",
      }),
    );

    expect(res.status).toBe(200);
    expect(dbSpies.select).not.toHaveBeenCalled();
  });

  it("returns ok and skips processing when ref is missing", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);

    const body = JSON.stringify({ installation: { id: 42 } });
    await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "push",
      }),
    );

    expect(dbSpies.select).not.toHaveBeenCalled();
  });

  it("strips the refs/heads/ prefix before comparing branches", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(true);
    primeDbResolves([{ id: "site-1", githubInstallationId: 42, publishableBranch: "develop" }]);

    const body = JSON.stringify({ installation: { id: 42 }, ref: "refs/heads/develop" });
    await githubRoutes.request(
      buildWebhookRequest(body, {
        "x-hub-signature-256": "sha256=ok",
        "x-github-event": "push",
      }),
    );

    // Match succeeds → push_matched logged with the stripped branch name.
    expect(mockLog.info).toHaveBeenCalledWith(
      "github.push_matched",
      expect.objectContaining({ branch: "develop" }),
    );
  });
});

describe("GET /setup", () => {
  function buildSetupRequest(query: Record<string, string>): Request {
    const params = new URLSearchParams(query);
    return new Request(`http://test.local/setup?${params.toString()}`, { method: "GET" });
  }

  it("returns 400 when installation_id query param is missing", async () => {
    const res = await githubRoutes.request(buildSetupRequest({ state: "org-1" }));

    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Missing installation_id or state");
  });

  it("redirects to ${DASHBOARD_URL}/login when the session is null", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await githubRoutes.request(
      buildSetupRequest({ installation_id: "42", state: "org-1" }),
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("http://localhost:3001/login");
  });

  it("returns 403 when the user has no membership row for the org", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    primeDbResolves([]);

    const res = await githubRoutes.request(
      buildSetupRequest({ installation_id: "42", state: "org-1" }),
    );

    expect(res.status).toBe(403);
    expect(await res.text()).toBe("Not a member of this organization");
    expect(mockGetInstallationOctokit).not.toHaveBeenCalled();
    expect(dbSpies.insert).not.toHaveBeenCalled();
  });

  it("coerces the installation_id query string to a number before calling getInstallationOctokit", async () => {
    // Source: `getInstallationOctokit(Number(installationId))`. The query
    // string is always a string — without the cast, the GitHub App auth flow
    // would receive "99" instead of 99 and silently break.
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    primeDbResolves([{ id: "member-1" }], []);
    mockGetInstallation.mockResolvedValue({
      data: { account: { login: "acme", type: "Organization" } },
    });

    await githubRoutes.request(buildSetupRequest({ installation_id: "99", state: "org-1" }));

    expect(mockGetInstallationOctokit).toHaveBeenCalledWith(99);
    expect(mockGetInstallationOctokit).not.toHaveBeenCalledWith("99");
  });

  it("upserts docsSites with githubOwner/githubOwnerType derived from the GitHub account", async () => {
    // Asserts the *logic-derived* fields only — id/orgId/sourceMode are
    // passthrough literals from input and would be theater to assert.
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    primeDbResolves([{ id: "member-1" }], []);
    mockGetInstallation.mockResolvedValue({
      data: { account: { login: "acme", type: "Organization" } },
    });

    await githubRoutes.request(buildSetupRequest({ installation_id: "42", state: "org-1" }));

    expect(dbSpies.values).toHaveBeenCalledWith(
      expect.objectContaining({ githubOwner: "acme", githubOwnerType: "Organization" }),
    );
    expect(dbSpies.onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        set: expect.objectContaining({
          githubOwner: "acme",
          githubOwnerType: "Organization",
        }),
      }),
    );
  });

  it("stores githubOwner as null when the account has no login field", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    primeDbResolves([{ id: "member-1" }], []);
    mockGetInstallation.mockResolvedValue({
      data: { account: { type: "Organization" } },
    });

    await githubRoutes.request(buildSetupRequest({ installation_id: "42", state: "org-1" }));

    expect(dbSpies.values).toHaveBeenCalledWith(expect.objectContaining({ githubOwner: null }));
  });

  it("stores githubOwnerType as null when the account type is not User or Organization", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    primeDbResolves([{ id: "member-1" }], []);
    mockGetInstallation.mockResolvedValue({
      data: { account: { login: "bot", type: "Bot" } },
    });

    await githubRoutes.request(buildSetupRequest({ installation_id: "42", state: "org-1" }));

    expect(dbSpies.values).toHaveBeenCalledWith(expect.objectContaining({ githubOwnerType: null }));
  });

  it("stores githubOwner and githubOwnerType as null when the installation account is null", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    primeDbResolves([{ id: "member-1" }], []);
    mockGetInstallation.mockResolvedValue({
      data: { account: null },
    });

    await githubRoutes.request(buildSetupRequest({ installation_id: "42", state: "org-1" }));

    expect(dbSpies.values).toHaveBeenCalledWith(
      expect.objectContaining({ githubOwner: null, githubOwnerType: null }),
    );
  });

  it("accepts githubOwnerType 'User' when account.type is 'User'", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    primeDbResolves([{ id: "member-1" }], []);
    mockGetInstallation.mockResolvedValue({
      data: { account: { login: "octocat", type: "User" } },
    });

    await githubRoutes.request(buildSetupRequest({ installation_id: "42", state: "org-1" }));

    expect(dbSpies.values).toHaveBeenCalledWith(
      expect.objectContaining({ githubOwnerType: "User" }),
    );
  });

  it("redirects to ${DASHBOARD_URL}/settings on successful setup", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    primeDbResolves([{ id: "member-1" }], []);
    mockGetInstallation.mockResolvedValue({
      data: { account: { login: "acme", type: "Organization" } },
    });

    const res = await githubRoutes.request(
      buildSetupRequest({ installation_id: "42", state: "org-1" }),
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("http://localhost:3001/settings");
  });
});
