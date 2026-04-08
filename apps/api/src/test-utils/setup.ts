import { vi } from "vite-plus/test";

// `@cloudflare/sandbox` transitively pulls in `@cloudflare/containers`, whose
// published `dist/index.js` re-exports from `./lib/container` without a file
// extension. Strict ESM resolution (Vitest/Vite) rejects extension-less relative
// imports, so the import chain explodes before any test runs. The sandbox is
// only exercised at runtime in production (Cloudflare Workers), so a stub is
// safe for unit tests.
vi.mock("@cloudflare/sandbox", () => ({
  Sandbox: class Sandbox {},
  getSandbox: vi.fn(() => ({
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    exec: vi.fn().mockResolvedValue({ success: true, exitCode: 0, stdout: "", stderr: "" }),
    destroy: vi.fn().mockResolvedValue(undefined),
  })),
}));

// `cloudflare:workflows` is a virtual Cloudflare module not resolvable in
// Vitest. Provide a stub for `NonRetryableError` so docs-router can be imported.
vi.mock("cloudflare:workflows", () => ({
  NonRetryableError: class NonRetryableError extends Error {
    constructor(message?: string) {
      super(message);
      this.name = "NonRetryableError";
    }
  },
}));

vi.mock("cloudflare:workers", () => ({
  // Stub WorkflowEntrypoint so classes that `extends WorkflowEntrypoint`
  // (e.g. PublishDocsWorkflow in docs-router) can be evaluated at import time.
  WorkflowEntrypoint: class WorkflowEntrypoint {},
  WorkflowStep: class WorkflowStep {},
  env: {
    DB: {},
    ENVIRONMENT: "dev",
    DASHBOARD_URL: "http://localhost:3001",
    SITE_URL: "http://localhost:3002",
    BETTER_AUTH_URL: "http://localhost:3000",
    BETTER_AUTH_SECRET: "test-secret",
    RESEND_API_KEY: "re_test",
    POLAR_ACCESS_TOKEN: "test-polar",
    POLAR_WEBHOOK_SECRET: "test-webhook",
    POSTHOG_PUBLIC_KEY: "phc_test",
    CLOUDFLARE_API_TOKEN: "test-cf",
    CLOUDFLARE_ZONE_ID: "test-zone",
    GITHUB_TOKEN: "test-github-token",
    GITHUB_APP_ID: "test-app-id",
    // `getInstallationOctokit` calls `atob(env.GITHUB_APP_PRIVATE_KEY)`, so this
    // must be valid base64. Decoded value is "fake-pem".
    GITHUB_APP_PRIVATE_KEY: "ZmFrZS1wZW0=",
    GITHUB_WEBHOOK_SECRET: "whsec_test_secret",
    RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    PUBLISH_ARTIFACTS: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    },
    DOCS_KV: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn().mockResolvedValue({ keys: [] }),
      getWithMetadata: vi.fn(),
    },
    PUBLISH_DOCS: {
      create: vi.fn(),
      get: vi.fn(),
    },
    DOCS_SOURCE: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn().mockResolvedValue({ objects: [], truncated: false }),
    },
    DOCS_DIST: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn().mockResolvedValue({ objects: [], truncated: false }),
    },
    BUILDER_SANDBOX: {},
  },
}));
