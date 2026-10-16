import { eq, inArray } from "drizzle-orm";

import type { Doc, DocInfo } from "../docs/doc";
import { hostKey, LIVE, redirectKey } from "../docs/names";
import { docs, hostnames } from "../schema/docs";
import { db } from "../utils/db";
import {
  createCustomHostname,
  deleteCustomHostname,
  domainStatus,
  type DomainStatus,
  getCustomHostname,
  type HostnameFailure,
  type Zone,
} from "./cloudflare";

export type DocRow = typeof docs.$inferSelect;
export type DomainRow = typeof hostnames.$inferSelect;

/** A doc's custom domain, as the dashboard shows it. */
export type Domain = {
  hostname: string;
  status: DomainStatus;
  /** The one record the customer adds. */
  record: { type: "CNAME"; name: string; target: string };
  /** Why Cloudflare cannot verify the domain or issue its certificate yet. */
  errors: string[];
};

/** Production is missing the zone or token custom domains need. */
export type NotConfigured = { code: "NOT_CONFIGURED"; message: string };

export type AddDomainError =
  | { code: "DOMAIN_EXISTS" }
  | { code: "HOSTNAME_TAKEN" }
  | { code: "HOSTNAME_REJECTED"; message: string }
  | NotConfigured;

type Result<T, E = NotConfigured> = ({ ok: true } & T) | { ok: false; error: E };

/** The bindings the domain code reads. */
export type DomainsEnv = Pick<
  Env,
  | "ENVIRONMENT"
  | "DOCS_DOMAIN"
  | "CUSTOM_HOSTNAMES_ZONE_ID"
  | "CUSTOM_HOSTNAMES_API_TOKEN"
  | "CUSTOM_DOMAIN_TARGET"
  | "DOMAINS"
  | "DOCS"
>;

type Deps = { env: DomainsEnv; fetch?: typeof globalThis.fetch };

/**
 * Where a doc is served, for the dashboard's links and for the build's canonical URLs: its
 * active custom domain, else `<slug>.DOCS_DOMAIN`. Development always serves
 * `<slug>.docs.localhost` on port 3003, because the dev dispatch Worker cannot serve custom domains.
 */
export function docUrl(
  slug: string,
  customHostname: string | null,
  env: Pick<Env, "ENVIRONMENT" | "DOCS_DOMAIN">,
) {
  if (env.ENVIRONMENT === "development") return `http://${slug}.${env.DOCS_DOMAIN}:3003`;
  return customHostname ? `https://${customHostname}` : `https://${slug}.${env.DOCS_DOMAIN}`;
}

/** The custom hostname a doc is served at, or null while it has none that works. */
export const activeHostname = (domain: DomainRow | null) =>
  domain?.status === "active" ? domain.hostname : null;

/** What the doc's Doc needs to know, or null for a source the editor does not manage. */
export function docInfo(doc: DocRow, url: string): DocInfo | null {
  if (doc.source.kind !== "managed") return null;
  return {
    docId: doc.id,
    slug: doc.slug,
    name: doc.name,
    repo: doc.source.artifactsRepo,
    docUrl: url,
  };
}

/**
 * Gives `doc` the custom domain `hostname`. Cloudflare serves it once the customer's CNAME
 * resolves and the certificate is issued, so it starts pending; development, which never calls
 * Cloudflare, makes it active at once. A refusal from Cloudflare (4xx) comes back as
 * HOSTNAME_REJECTED; one a retry may fix (5xx, 429, transport) throws.
 */
export async function addDomain({
  env,
  fetch = globalThis.fetch,
  doc,
  hostname,
}: Deps & { doc: DocRow; hostname: string }): Promise<Result<{ domain: Domain }, AddDomainError>> {
  const cloudflare = cloudflareZone(env);
  if (!cloudflare.ok) return cloudflare;

  const [existing] = await db.select().from(hostnames).where(eq(hostnames.docId, doc.id));
  if (existing) return { ok: false, error: { code: "DOMAIN_EXISTS" } };
  const [taken] = await db.select().from(hostnames).where(eq(hostnames.hostname, hostname));
  if (taken) return { ok: false, error: { code: "HOSTNAME_TAKEN" } };

  let created: { id: string | null; status: DomainStatus; errors: string[] } = {
    id: null,
    status: "active",
    errors: [],
  };
  const { zone } = cloudflare;
  if (zone) {
    const result = await createCustomHostname({ zone, hostname, fetch });
    if (!result.ok) {
      if (!refused(result)) throw cloudflareError(result);
      const message = result.errors.map((error) => error.message).join("; ") || result.message;
      return { ok: false, error: { code: "HOSTNAME_REJECTED", message } };
    }
    created = { id: result.record.id, ...domainStatus(result.record) };
  }

  const [row] = await db
    .insert(hostnames)
    .values({
      hostname,
      docId: doc.id,
      cloudflareId: created.id,
      status: "pending",
      createdAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();
  if (!row) {
    // Another add got in between the checks and the insert.
    if (zone && created.id) await deleteRegistered(zone, created.id, fetch);
    const [mine] = await db.select().from(hostnames).where(eq(hostnames.docId, doc.id));
    return { ok: false, error: { code: mine ? "DOMAIN_EXISTS" : "HOSTNAME_TAKEN" } };
  }

  // Written now rather than once active: Cloudflare only sends the hostname's traffic here once it
  // is active, so routing never waits on the status sync.
  await env.DOMAINS.put(hostKey(hostname), doc.slug);
  const settled = await settle(env, doc, row, created.status);
  return { ok: true, domain: toDomain(settled, created.errors, env) };
}

/** Reads the domain's status from Cloudflare and applies what changed. */
export async function refreshDomain({
  env,
  fetch = globalThis.fetch,
  doc,
  row,
}: Deps & { doc: DocRow; row: DomainRow }): Promise<Result<{ domain: Domain }>> {
  const cloudflare = cloudflareZone(env);
  if (!cloudflare.ok) return cloudflare;
  const { zone } = cloudflare;
  if (!zone || row.cloudflareId === null) return { ok: true, domain: toDomain(row, [], env) };

  const result = await getCustomHostname({ zone, id: row.cloudflareId, fetch });
  if (!result.ok) throw cloudflareError(result);
  const { status, errors } = domainStatus(result.record);
  const settled = await settle(env, doc, row, status);
  return { ok: true, domain: toDomain(settled, errors, env) };
}

/**
 * Removes the domain from Cloudflare, routing and the doc's URL. The row goes after everything
 * that can fail and leave the domain serving, so the user can remove it again.
 */
export async function removeDomain({
  env,
  fetch = globalThis.fetch,
  doc,
  row,
}: Deps & { doc: DocRow; row: DomainRow }): Promise<Result<object>> {
  const cloudflare = cloudflareZone(env);
  if (!cloudflare.ok) return cloudflare;
  const { zone } = cloudflare;
  if (zone && row.cloudflareId !== null) await deleteRegistered(zone, row.cloudflareId, fetch);
  await env.DOMAINS.delete(hostKey(row.hostname));
  await redirect(env, doc, row.hostname, row.status === "active", false);
  await db.delete(hostnames).where(eq(hostnames.hostname, row.hostname));
  await rebuild(env, doc, row.hostname, row.status === "active", false);
  return { ok: true };
}

/**
 * Syncs every domain that is pending or active with Cloudflare, for the cron. An active domain
 * can still break, for example when its owner points the CNAME elsewhere. One failing domain does
 * not stop the rest.
 */
export async function refreshDomains({ env, fetch = globalThis.fetch }: Deps): Promise<void> {
  const cloudflare = cloudflareZone(env);
  if (!cloudflare.ok) {
    console.error(`custom domains not refreshed: ${cloudflare.error.message}`);
    return;
  }
  if (!cloudflare.zone) return;

  const rows = await db
    .select({ doc: docs, row: hostnames })
    .from(hostnames)
    .innerJoin(docs, eq(docs.id, hostnames.docId))
    .where(inArray(hostnames.status, ["pending", "active"]));
  for (const { doc, row } of rows) {
    try {
      await refreshDomain({ env, fetch, doc, row });
    } catch (error) {
      console.error(`could not refresh the custom domain ${row.hostname}`, error);
    }
  }
}

export function toDomain(row: DomainRow, errors: string[], env: DomainsEnv): Domain {
  return {
    hostname: row.hostname,
    status: row.status,
    record: { type: "CNAME", name: row.hostname, target: env.CUSTOM_DOMAIN_TARGET },
    errors,
  };
}

// The redirect is written before the status, so a failure there leaves the old status and the next
// refresh tries again. The rebuild runs after it, because every `openDoc` re-inits the Doc with the
// URL the stored status gives, and a queued build must not start with the old one.
async function settle(env: DomainsEnv, doc: DocRow, row: DomainRow, status: DomainStatus) {
  if (status === row.status) return row;
  const wasActive = row.status === "active";
  const isActive = status === "active";
  await redirect(env, doc, row.hostname, wasActive, isActive);
  await db.update(hostnames).set({ status }).where(eq(hostnames.hostname, row.hostname));
  await rebuild(env, doc, row.hostname, wasActive, isActive);
  return { ...row, status };
}

/** A doc's `<slug>` address redirects to its custom domain exactly while the domain is active. */
async function redirect(
  env: DomainsEnv,
  doc: DocRow,
  hostname: string,
  wasActive: boolean,
  isActive: boolean,
) {
  if (wasActive === isActive) return;
  if (isActive) await env.DOMAINS.put(redirectKey(doc.slug), hostname);
  else await env.DOMAINS.delete(redirectKey(doc.slug));
}

/** Builds the live target again when the doc's URL changed, so its canonical URLs follow. */
async function rebuild(
  env: DomainsEnv,
  doc: DocRow,
  hostname: string,
  wasActive: boolean,
  isActive: boolean,
) {
  const url = docUrl(doc.slug, isActive ? hostname : null, env);
  if (url === docUrl(doc.slug, wasActive ? hostname : null, env)) return;
  const info = docInfo(doc, url);
  if (!info) return;
  // The binding names this Worker by string, so cf/config cannot infer the class.
  const stub = (env.DOCS as DurableObjectNamespace<Doc>).getByName(doc.id);
  await stub.init(info);
  await stub.rebuild(LIVE);
}

/** The zone to register hostnames on, or null in development, which never calls Cloudflare. */
function cloudflareZone(env: DomainsEnv): Result<{ zone: Zone | null }> {
  if (env.ENVIRONMENT === "development") return { ok: true, zone: null };
  for (const name of ["CUSTOM_HOSTNAMES_ZONE_ID", "CUSTOM_HOSTNAMES_API_TOKEN"] as const) {
    if (!env[name]) {
      const message = `Custom domains are not configured: ${name} is not set`;
      return { ok: false, error: { code: "NOT_CONFIGURED", message } };
    }
  }
  return {
    ok: true,
    zone: { id: env.CUSTOM_HOSTNAMES_ZONE_ID, apiToken: env.CUSTOM_HOSTNAMES_API_TOKEN },
  };
}

async function deleteRegistered(zone: Zone, id: string, fetch: typeof globalThis.fetch) {
  const result = await deleteCustomHostname({ zone, id, fetch });
  if (!result.ok) throw cloudflareError(result);
}

// A 4xx other than 429 is Cloudflare refusing this hostname; anything else may pass on a retry.
const refused = ({ status }: HostnameFailure) => status >= 400 && status < 500 && status !== 429;

function cloudflareError({ step, status, message }: HostnameFailure) {
  return new Error(`Cloudflare custom hostname ${step} failed (HTTP ${status}): ${message}`);
}
