import { vi } from "vite-plus/test";

vi.mock("cloudflare:workers", () => ({
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
  },
}));
