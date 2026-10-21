import { afterEach, describe, expect, it } from "vite-plus/test";

import { env } from "../test/bindings";
import { createClient } from "../test/client";

describe("builder dev route", () => {
  afterEach(() => {
    env.ENVIRONMENT = "development";
  });

  it("does not exist in production", async () => {
    env.ENVIRONMENT = "production";
    const client = createClient();
    const responses = await Promise.all([
      client.post("/dev/builder/acme/reset", [
        { path: "src/content/docs/index.mdx", base64: "eA==" },
      ]),
      client.post("/dev/builder/acme/build", { docUrl: "https://acme.shiru.sh", docsRoot: "" }),
      client.request("/dev/builder/acme/asset?path=/index.html"),
      client.request("/dev/docs/acme/guides/setup/"),
      client.request("/dev/docs/acme"),
    ]);
    expect(
      await Promise.all(
        responses.map(async (response) => [response.status, await response.text()]),
      ),
    ).toEqual([
      [404, "404 Not Found"],
      [404, "404 Not Found"],
      [404, "404 Not Found"],
      [404, "404 Not Found"],
      [404, "404 Not Found"],
    ]);
  });

  it("serves only docs that exist, and sends a bare name to its root", async () => {
    const client = createClient();
    const missing = await client.request("/dev/docs/nobody/");
    expect([missing.status, await missing.text()]).toEqual([404, "No site at this address"]);
    const bare = await client.request("/dev/docs/nobody");
    expect([bare.status, bare.headers.get("location")]).toEqual([307, "nobody/"]);
  });

  it("takes a draft target's worker name, and refuses names no target has", async () => {
    const client = createClient();
    const responses = await Promise.all(
      ["nobody--draft/", "nobody--live/", "nobody--draft--x/", "www/"].map((name) =>
        client.request(`/dev/docs/${name}`),
      ),
    );
    expect(
      await Promise.all(
        responses.map(async (response) => [response.status, await response.text()]),
      ),
    ).toEqual(Array.from({ length: 4 }, () => [404, "No site at this address"]));
    const bare = await client.request("/dev/docs/acme--draft");
    expect([bare.status, bare.headers.get("location")]).toEqual([307, "acme--draft/"]);
  });
});
