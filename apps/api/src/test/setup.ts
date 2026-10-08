import { vi } from "vite-plus/test";

vi.mock("cloudflare:workers", async () => {
  const { env, waitUntil } = await import("./bindings");
  return { env, waitUntil };
});

vi.mock("../utils/db", async () => {
  const { db } = await import("./bindings");
  return { db };
});

vi.mock("@polar-sh/sdk", async () => {
  const { Polar } = await import("./bindings");
  return { Polar };
});
