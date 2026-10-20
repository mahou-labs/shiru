import { describe, expect, it } from "vite-plus/test";

import {
  createCustomHostname,
  type CustomHostnameRecord,
  deleteCustomHostname,
  domainStatus,
  getCustomHostname,
  revalidateCustomHostname,
} from "./cloudflare";
import { FakeCloudflareZone, HOSTNAMES } from "../test/cloudflare-zone";

const zone = { id: "zone1", apiToken: "zone-token" };

describe("createCustomHostname", () => {
  it("registers the hostname for HTTP validation and returns the record", async () => {
    const cloudflare = new FakeCloudflareZone();

    expect(
      await createCustomHostname({ zone, hostname: "docs.acme.com", fetch: cloudflare.fetch }),
    ).toEqual({
      ok: true,
      record: {
        id: "ch-1",
        hostname: "docs.acme.com",
        status: "pending",
        verification_errors: ["custom hostname does not CNAME to this zone."],
        ssl: { status: "pending_validation", validation_errors: [] },
      },
    });
    expect(cloudflare.requests).toEqual([
      {
        method: "POST",
        url: HOSTNAMES,
        authorization: "Bearer zone-token",
        json: { hostname: "docs.acme.com", ssl: { method: "http", type: "dv" } },
      },
    ]);
  });

  it("returns Cloudflare's refusal", async () => {
    const cloudflare = new FakeCloudflareZone();
    cloudflare.failNext("POST", HOSTNAMES, 409, {
      success: false,
      errors: [{ code: 1406, message: "Duplicate custom hostname found." }],
      result: null,
    });

    expect(
      await createCustomHostname({ zone, hostname: "docs.acme.com", fetch: cloudflare.fetch }),
    ).toEqual({
      ok: false,
      step: "create",
      status: 409,
      message: "Duplicate custom hostname found. (1406)",
      errors: [{ code: 1406, message: "Duplicate custom hostname found." }],
    });
  });
});

describe("getCustomHostname", () => {
  it("reads a hostname by id", async () => {
    const cloudflare = new FakeCloudflareZone();
    await createCustomHostname({ zone, hostname: "docs.acme.com", fetch: cloudflare.fetch });
    cloudflare.activate("ch-1");

    expect(await getCustomHostname({ zone, id: "ch-1", fetch: cloudflare.fetch })).toEqual({
      ok: true,
      record: {
        id: "ch-1",
        hostname: "docs.acme.com",
        status: "active",
        verification_errors: [],
        ssl: { status: "active", validation_errors: [] },
      },
    });
    expect(cloudflare.requests.at(-1)).toEqual({
      method: "GET",
      url: `${HOSTNAMES}/ch-1`,
      authorization: "Bearer zone-token",
    });
  });

  it("returns null for a hostname Cloudflare does not have", async () => {
    const cloudflare = new FakeCloudflareZone();
    expect(await getCustomHostname({ zone, id: "gone", fetch: cloudflare.fetch })).toEqual({
      ok: true,
      record: null,
    });
  });

  it("returns a server error as a failure", async () => {
    const cloudflare = new FakeCloudflareZone();
    cloudflare.failNext("GET", `${HOSTNAMES}/ch-1`, 502, "Bad gateway");
    expect(await getCustomHostname({ zone, id: "ch-1", fetch: cloudflare.fetch })).toEqual({
      ok: false,
      step: "get",
      status: 502,
      message: "HTTP 502: Bad gateway",
      errors: [],
    });
  });
});

describe("revalidateCustomHostname", () => {
  it("sends Cloudflare the same SSL settings so it checks again, and returns the record", async () => {
    const cloudflare = new FakeCloudflareZone();
    await createCustomHostname({ zone, hostname: "docs.acme.com", fetch: cloudflare.fetch });

    expect(await revalidateCustomHostname({ zone, id: "ch-1", fetch: cloudflare.fetch })).toEqual({
      ok: true,
      record: {
        id: "ch-1",
        hostname: "docs.acme.com",
        status: "pending",
        verification_errors: ["custom hostname does not CNAME to this zone."],
        ssl: { status: "pending_validation", validation_errors: [] },
      },
    });
    expect(cloudflare.requests.at(-1)).toEqual({
      method: "PATCH",
      url: `${HOSTNAMES}/ch-1`,
      authorization: "Bearer zone-token",
      json: { ssl: { method: "http", type: "dv" } },
    });
  });

  it("returns null for a hostname Cloudflare deleted", async () => {
    const cloudflare = new FakeCloudflareZone();
    expect(await revalidateCustomHostname({ zone, id: "gone", fetch: cloudflare.fetch })).toEqual({
      ok: true,
      record: null,
    });
  });

  it("returns a server error as a failure", async () => {
    const cloudflare = new FakeCloudflareZone();
    cloudflare.failNext("PATCH", `${HOSTNAMES}/ch-1`, 503, "Unavailable");
    expect(await revalidateCustomHostname({ zone, id: "ch-1", fetch: cloudflare.fetch })).toEqual({
      ok: false,
      step: "revalidate",
      status: 503,
      message: "HTTP 503: Unavailable",
      errors: [],
    });
  });
});

describe("deleteCustomHostname", () => {
  it("deletes a hostname, and counts one that is already gone as deleted", async () => {
    const cloudflare = new FakeCloudflareZone();
    await createCustomHostname({ zone, hostname: "docs.acme.com", fetch: cloudflare.fetch });

    expect(await deleteCustomHostname({ zone, id: "ch-1", fetch: cloudflare.fetch })).toEqual({
      ok: true,
    });
    expect(cloudflare.hostnames.size).toBe(0);
    expect(await deleteCustomHostname({ zone, id: "ch-1", fetch: cloudflare.fetch })).toEqual({
      ok: true,
    });
    expect(cloudflare.requests.map(({ method, url }) => `${method} ${url}`)).toEqual([
      `POST ${HOSTNAMES}`,
      `DELETE ${HOSTNAMES}/ch-1`,
      `DELETE ${HOSTNAMES}/ch-1`,
    ]);
  });

  it("returns a refusal as a failure", async () => {
    const cloudflare = new FakeCloudflareZone();
    cloudflare.failNext("DELETE", `${HOSTNAMES}/ch-1`, 403, {
      success: false,
      errors: [{ code: 10000, message: "Authentication error" }],
      result: null,
    });
    expect(await deleteCustomHostname({ zone, id: "ch-1", fetch: cloudflare.fetch })).toEqual({
      ok: false,
      step: "delete",
      status: 403,
      message: "Authentication error (10000)",
      errors: [{ code: 10000, message: "Authentication error" }],
    });
  });
});

describe("domainStatus", () => {
  const record = (
    status: string,
    ssl: string,
    errors: Partial<CustomHostnameRecord> = {},
  ): CustomHostnameRecord => ({
    id: "ch-1",
    hostname: "docs.acme.com",
    status,
    ssl: { status: ssl },
    ...errors,
  });

  it.each([
    ["active", "active", "active"],
    ["pending", "pending_validation", "pending"],
    ["active", "pending_validation", "pending"],
    ["pending", "active", "pending"],
    ["active", "pending_deployment", "pending"],
    ["active", "initializing", "pending"],
    ["blocked", "active", "failed"],
    ["moved", "active", "failed"],
    ["deleted", "deleted", "failed"],
    ["pending_deletion", "active", "failed"],
    ["pending_blocked", "pending_validation", "failed"],
    ["pending", "validation_timed_out", "failed"],
    ["active", "issuance_timed_out", "failed"],
    ["active", "expired", "failed"],
    ["active", "deactivating", "failed"],
    ["active", "inactive", "failed"],
  ])("hostname %s with certificate %s is %s", (hostname, ssl, status) => {
    expect(domainStatus(record(hostname, ssl)).status).toBe(status);
  });

  it("merges verification and certificate errors without repeats", () => {
    expect(
      domainStatus({
        ...record("pending", "pending_validation"),
        verification_errors: ["custom hostname does not CNAME to this zone.", "No TXT record"],
        ssl: {
          status: "pending_validation",
          validation_errors: [
            { message: "No TXT record" },
            { message: "caa_error: blocked by CAA record" },
          ],
        },
      }),
    ).toEqual({
      status: "pending",
      errors: [
        "custom hostname does not CNAME to this zone.",
        "No TXT record",
        "caa_error: blocked by CAA record",
      ],
    });
  });

  it("fails a hostname Cloudflare no longer has", () => {
    expect(domainStatus(null)).toEqual({
      status: "failed",
      errors: ["Cloudflare no longer has this domain"],
    });
  });
});
