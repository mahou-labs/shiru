import { vi } from "vite-plus/test";

vi.mock("cloudflare:workers", async () => {
  const { env, waitUntil } = await import("./bindings");
  // Base classes only, so modules that declare a Durable Object or import @cloudflare/sandbox load.
  return { env, waitUntil, DurableObject: class {}, WorkerEntrypoint: class {} };
});

vi.mock("../utils/db", async () => {
  const { db } = await import("./bindings");
  return { db };
});

vi.mock("@polar-sh/sdk", async () => {
  const { Polar } = await import("./bindings");
  return { Polar };
});
