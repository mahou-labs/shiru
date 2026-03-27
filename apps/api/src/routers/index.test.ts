import { createRouterClient } from "@orpc/server";
import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("../utils/auth", () => ({
  auth: { api: { listOrganizations: vi.fn(), setActiveOrganization: vi.fn() } },
}));

vi.mock("@/utils/db", () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue(Promise.resolve([])),
  };
  return { db: mockChain };
});

vi.mock("@/utils/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/utils/email", () => ({
  resend: { contacts: { create: vi.fn() }, emails: { send: vi.fn() } },
  sendVerificationEmail: vi.fn(),
}));

import { createUnauthenticatedContext } from "../test-utils/helpers";
import { appRouter } from "./index";

function createClient(context = createUnauthenticatedContext()) {
  return createRouterClient(appRouter, { context });
}

describe("appRouter", () => {
  it("healthCheck returns 'OK'", async () => {
    const client = createClient();
    const result = await client.healthCheck();
    expect(result).toBe("OK");
  });

  it("exposes all sub-routers", () => {
    expect(appRouter).toHaveProperty("onboarding");
    expect(appRouter).toHaveProperty("organization");
    expect(appRouter).toHaveProperty("user");
    expect(appRouter).toHaveProperty("waitlist");
    expect(appRouter).toHaveProperty("healthCheck");
  });
});
