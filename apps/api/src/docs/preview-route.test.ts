import { describe, expect, it } from "vite-plus/test";

import { env } from "../test/bindings";
import { createClient } from "../test/client";
import { verifyGrant } from "./preview-access";

const HOST = "draft--authorize.preview.docs.localhost";

async function member(email: string, organization: string) {
  const client = createClient();
  await client.signUpVerified(email);
  await client.createOrganization(organization);
  return client;
}

const authorize = (client: ReturnType<typeof createClient>, host: string, path: string) =>
  client.request(`/preview/authorize?${new URLSearchParams({ host, path }).toString()}`);

async function answer(response: Response) {
  return {
    status: response.status,
    body: await response.text(),
    location: response.headers.get("location"),
    cacheControl: response.headers.get("cache-control"),
  };
}

describe("GET /preview/authorize", () => {
  it("sends a member back to the preview host with a handoff grant for it", async () => {
    const client = await member("authorize-member@example.com", "Authorize");
    await client.rpc("docs/create", { slug: "authorize", name: "Docs", visibility: "public" });

    const response = await authorize(client, HOST, "/guides/?tab=npm");
    expect([response.status, response.headers.get("cache-control")]).toEqual([302, "no-store"]);
    const location = new URL(response.headers.get("location")!);
    expect([location.origin, location.pathname, location.searchParams.get("path")]).toEqual([
      `http://${HOST}:3003`,
      "/__shiru/preview-auth",
      "/guides/?tab=npm",
    ]);

    const token = location.searchParams.get("token")!;
    const grant = {
      kind: "handoff" as const,
      host: HOST,
      now: Date.now(),
      secret: env.PREVIEW_SECRET,
    };
    expect(await verifyGrant(token, grant)).toBe(true);
    expect(await verifyGrant(token, { ...grant, kind: "session" })).toBe(false);
    expect(await verifyGrant(token, { ...grant, now: Date.now() + 60_000 })).toBe(false);
  });

  it("never sends a member off the preview host", async () => {
    const client = await member("authorize-escape@example.com", "Authorize Escape");
    await client.rpc("docs/create", { slug: "escape", name: "Docs", visibility: "public" });

    const response = await authorize(
      client,
      "draft--escape.preview.docs.localhost",
      "//evil.example",
    );
    expect(new URL(response.headers.get("location")!).searchParams.get("path")).toBe("/");
  });

  it("sends a signed-out visitor to sign in on the dashboard first", async () => {
    expect(await answer(await authorize(createClient(), HOST, "/guides/"))).toEqual({
      status: 302,
      body: "",
      location: `http://localhost:3001/preview?host=${HOST}&path=%2Fguides%2F`,
      cacheControl: "no-store",
    });
  });

  it("gives a missing doc and another organization's doc the same answer", async () => {
    const owner = await member("authorize-owner@example.com", "Authorize Owner");
    await owner.rpc("docs/create", { slug: "private", name: "Docs", visibility: "public" });
    const stranger = await member("authorize-stranger@example.com", "Authorize Stranger");

    const notHere = {
      status: 404,
      body: "No preview here",
      location: null,
      cacheControl: "no-store",
    };
    expect(
      await answer(await authorize(stranger, "draft--private.preview.docs.localhost", "/")),
    ).toEqual(notHere);
    expect(
      await answer(await authorize(stranger, "draft--nobody.preview.docs.localhost", "/")),
    ).toEqual(notHere);
  });

  it.each(["authorize.docs.localhost", "live--authorize.preview.docs.localhost", "example.com"])(
    "refuses %s, which is not a preview",
    async (host) => {
      expect(await answer(await authorize(createClient(), host, "/"))).toEqual({
        status: 400,
        body: "Not a preview address",
        location: null,
        cacheControl: "no-store",
      });
    },
  );
});
