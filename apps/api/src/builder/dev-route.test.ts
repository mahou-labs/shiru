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
      client.post("/dev/builder/acme/reset", [{ path: "content/index.mdx", content: "x" }]),
      client.post("/dev/builder/acme/build", { siteUrl: "https://acme.shiru.sh", docsRoot: "" }),
      client.request("/dev/builder/acme/asset?path=/index.html"),
    ]);
    expect(
      await Promise.all(
        responses.map(async (response) => [response.status, await response.text()]),
      ),
    ).toEqual([
      [404, "404 Not Found"],
      [404, "404 Not Found"],
      [404, "404 Not Found"],
    ]);
  });
});
