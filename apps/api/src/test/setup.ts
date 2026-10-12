import { vi } from "vite-plus/test";

vi.mock("cloudflare:workers", async () => {
  const { env, waitUntil } = await import("./bindings");
  // Base classes only, so modules that declare a Durable Object or import @cloudflare/sandbox load.
  // DurableObject keeps ctx and env like the runtime's, so the SITE_DO binding runs the real class.
  class DurableObject {
    constructor(
      protected ctx: unknown,
      protected env: unknown,
    ) {}
  }
  return {
    env,
    waitUntil,
    DurableObject,
    WorkerEntrypoint: class {},
    WorkflowEntrypoint: class {},
  };
});

vi.mock("../utils/db", async () => {
  const { db } = await import("./bindings");
  return { db };
});

vi.mock("@polar-sh/sdk", async () => {
  const { Polar } = await import("./bindings");
  return { Polar };
});
