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

// The real SDK runs; only its HTTP hop to Polar goes to the in-memory API instead.
vi.mock("@polar-sh/sdk/2026-10", async (importOriginal) => {
  const sdk = await importOriginal<typeof import("@polar-sh/sdk/2026-10")>();
  const { polarApi } = await import("./bindings");
  return {
    ...sdk,
    createPolarCore: (options: Parameters<typeof sdk.createPolarCore>[0]) => {
      const client = sdk.createPolarCore(options);
      client.sendRequest = async ([url, init]) => polarApi(new Request(url, init));
      return client;
    },
  };
});
