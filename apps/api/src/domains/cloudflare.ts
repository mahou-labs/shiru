import { z } from "zod";

import { CLOUDFLARE_API, type CloudflareFailure, parseResponse } from "../deploy/deploy";

/** A Cloudflare for SaaS zone and a token that can edit its custom hostnames. */
export type Zone = { id: string; apiToken: string };

export type HostnameStep = "create" | "get" | "revalidate" | "delete";

export type HostnameFailure = CloudflareFailure<HostnameStep>;

const customHostname = z.object({
  id: z.string(),
  hostname: z.string(),
  status: z.string(),
  verification_errors: z.array(z.string()).nullish(),
  ssl: z.object({
    status: z.string(),
    validation_errors: z.array(z.object({ message: z.string() })).nullish(),
  }),
});

/** The fields of a Cloudflare custom hostname this code reads. */
export type CustomHostnameRecord = z.infer<typeof customHostname>;

const SSL = { method: "http", type: "dv" } as const;

/**
 * Registers `hostname` on the zone. Cloudflare validates the certificate over HTTP once the
 * customer's CNAME points at the zone, so the CNAME is the only record they add.
 */
export async function createCustomHostname({
  zone,
  hostname,
  fetch = globalThis.fetch,
}: {
  zone: Zone;
  hostname: string;
  fetch?: typeof globalThis.fetch;
}): Promise<{ ok: true; record: CustomHostnameRecord } | HostnameFailure> {
  const response = await fetch(hostnamesUrl(zone), {
    method: "POST",
    headers: { Authorization: `Bearer ${zone.apiToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ hostname, ssl: SSL }),
  });
  const parsed = await parseResponse("create", response, customHostname);
  return parsed.ok ? { ok: true, record: parsed.result } : parsed;
}

/** The custom hostname with this id, or null when Cloudflare no longer has it. */
export async function getCustomHostname({
  zone,
  id,
  fetch = globalThis.fetch,
}: {
  zone: Zone;
  id: string;
  fetch?: typeof globalThis.fetch;
}): Promise<{ ok: true; record: CustomHostnameRecord | null } | HostnameFailure> {
  const response = await fetch(`${hostnamesUrl(zone)}/${id}`, {
    headers: { Authorization: `Bearer ${zone.apiToken}` },
  });
  if (response.status === 404) return { ok: true, record: null };
  const parsed = await parseResponse("get", response, customHostname);
  return parsed.ok ? { ok: true, record: parsed.result } : parsed;
}

/**
 * Asks Cloudflare to check the hostname again now. Cloudflare retries validation on a backoff that
 * grows to four hours, and a PATCH that changes nothing restarts it. Null when Cloudflare no longer
 * has the hostname, which it deletes after seven days without validating.
 */
export async function revalidateCustomHostname({
  zone,
  id,
  fetch = globalThis.fetch,
}: {
  zone: Zone;
  id: string;
  fetch?: typeof globalThis.fetch;
}): Promise<{ ok: true; record: CustomHostnameRecord | null } | HostnameFailure> {
  const response = await fetch(`${hostnamesUrl(zone)}/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${zone.apiToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ssl: SSL }),
  });
  if (response.status === 404) return { ok: true, record: null };
  const parsed = await parseResponse("revalidate", response, customHostname);
  return parsed.ok ? { ok: true, record: parsed.result } : parsed;
}

/** Deletes a custom hostname. One that is already gone counts as deleted. */
export async function deleteCustomHostname({
  zone,
  id,
  fetch = globalThis.fetch,
}: {
  zone: Zone;
  id: string;
  fetch?: typeof globalThis.fetch;
}): Promise<{ ok: true } | HostnameFailure> {
  const response = await fetch(`${hostnamesUrl(zone)}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${zone.apiToken}` },
  });
  if (response.status === 404) return { ok: true };
  const parsed = await parseResponse("delete", response, z.unknown());
  return parsed.ok ? { ok: true } : parsed;
}

export type DomainStatus = "pending" | "active" | "failed";

// States Cloudflare does not leave without someone acting: the hostname moved to another zone, was
// blocked or deleted, or its certificate validation gave up or lapsed.
const FAILED_HOSTNAME = new Set([
  "blocked",
  "moved",
  "deleted",
  "pending_deletion",
  "pending_blocked",
]);
const FAILED_SSL = new Set([
  "validation_timed_out",
  "issuance_timed_out",
  "expired",
  "deleted",
  "deactivating",
  "inactive",
]);

/** Where a custom hostname stands, with Cloudflare's reasons it is not working yet. */
export function domainStatus(record: CustomHostnameRecord | null): {
  status: DomainStatus;
  errors: string[];
} {
  if (!record) return { status: "failed", errors: ["Cloudflare no longer has this domain"] };
  const errors = [
    ...new Set([
      ...(record.verification_errors ?? []),
      ...(record.ssl.validation_errors ?? []).map((error) => error.message),
    ]),
  ];
  if (record.status === "active" && record.ssl.status === "active") {
    return { status: "active", errors };
  }
  const failed = FAILED_HOSTNAME.has(record.status) || FAILED_SSL.has(record.ssl.status);
  return { status: failed ? "failed" : "pending", errors };
}

function hostnamesUrl(zone: Zone) {
  return `${CLOUDFLARE_API}/zones/${zone.id}/custom_hostnames`;
}
