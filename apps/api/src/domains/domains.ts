import { and, eq, inArray } from "drizzle-orm";

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
  status: DomainRow["status"];
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

/**
 * The doc's slug and URL as stored right now. A build reads them when it starts, so a domain that
 * changes while the build waits in the queue still reaches it.
 */
export async function servedAt(docId: string, env: Pick<Env, "ENVIRONMENT" | "DOCS_DOMAIN">) {
  const [found] = await db
    .select({ slug: docs.slug, domain: hostnames })
    .from(docs)
    .leftJoin(hostnames, eq(hostnames.docId, docs.id))
    .where(eq(docs.id, docId));
  if (!found) return null;
  return { slug: found.slug, url: docUrl(found.slug, activeHostname(found.domain), env) };
}

/** What the doc's Doc needs to know, or null for a source the editor does not manage. */
export function docInfo(doc: DocRow): DocInfo | null {
  if (doc.source.kind !== "managed") return null;
  return { docId: doc.id, slug: doc.slug, name: doc.name, repo: doc.source.artifactsRepo };
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

  // Routed from the start rather than once active: Cloudflare only sends the hostname's traffic
  // here once it is active, so routing never waits on the status sync.
  const settled = await settle(env, doc, row, created.status);
  return { ok: true, domain: toDomain(settled ?? row, created.errors, env) };
}

/**
 * Reads the domain's status from Cloudflare, applies what changed and repairs its routing. Null
 * when the domain was removed meanwhile.
 */
export async function refreshDomain({
  env,
  fetch = globalThis.fetch,
  doc,
  row,
}: Deps & { doc: DocRow; row: DomainRow }): Promise<Result<{ domain: Domain | null }>> {
  const cloudflare = cloudflareZone(env);
  if (!cloudflare.ok) return cloudflare;
  const { zone } = cloudflare;

  let status: DomainStatus | undefined;
  let errors: string[] = [];
  if (zone && row.cloudflareId !== null && row.status !== "removing") {
    const result = await getCustomHostname({ zone, id: row.cloudflareId, fetch });
    if (!result.ok) throw cloudflareError(result);
    ({ status, errors } = domainStatus(result.record));
  }
  const settled = await settle(env, doc, row, status);
  return { ok: true, domain: settled && toDomain(settled, errors, env) };
}

/**
 * Stops serving the domain, then deletes it from Cloudflare and the database. The row stays as
 * `removing` until both are gone, so a failure on the way leaves something to remove again, and a
 * status sync running meanwhile cannot bring the domain back.
 */
export async function removeDomain({
  env,
  fetch = globalThis.fetch,
  doc,
  row,
}: Deps & { doc: DocRow; row: DomainRow }): Promise<Result<object>> {
  const cloudflare = cloudflareZone(env);
  if (!cloudflare.ok) return cloudflare;

  const marked = await markRemoving(row.hostname);
  if (!marked) return { ok: true };
  await project(env, row.hostname, doc);
  // A retry cannot tell whether the domain was active before, so it builds again to be sure.
  if (marked.was === "active" || marked.was === "removing") await rebuild(env, doc, row.hostname);

  const { zone } = cloudflare;
  if (zone && marked.row.cloudflareId !== null) {
    await deleteRegistered(zone, marked.row.cloudflareId, fetch);
  }
  await db.delete(hostnames).where(eq(hostnames.hostname, row.hostname));
  await project(env, row.hostname, doc);
  return { ok: true };
}

/**
 * Syncs every domain that is pending or active with Cloudflare, for the cron, and finishes
 * removals that failed part way. An active domain can still break, for example when its owner
 * points the CNAME elsewhere. One failing domain does not stop the rest.
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
    .where(inArray(hostnames.status, ["pending", "active", "removing"]));
  for (const { doc, row } of rows) {
    try {
      if (row.status === "removing") await removeDomain({ env, fetch, doc, row });
      else await refreshDomain({ env, fetch, doc, row });
    } catch (error) {
      console.error(`could not sync the custom domain ${row.hostname}`, error);
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

/**
 * Moves the row from the status `row` was read with to `status`. A row that changed since, such as
 * one being removed, keeps its status, so a sync that read it earlier cannot undo the change.
 * Routing is written from the row as it ends up either way.
 */
async function settle(
  env: DomainsEnv,
  doc: DocRow,
  row: DomainRow,
  status: DomainStatus | undefined,
): Promise<DomainRow | null> {
  let settled: DomainRow | null = row;
  if (status !== undefined && status !== row.status) {
    const [updated] = await db
      .update(hostnames)
      .set({ status })
      .where(and(eq(hostnames.hostname, row.hostname), eq(hostnames.status, row.status)))
      .returning();
    if (updated && (row.status === "active") !== (status === "active")) {
      await rebuild(env, doc, row.hostname);
    }
    settled = updated ?? (await domainRow(row.hostname));
  }
  await project(env, row.hostname, doc);
  return settled;
}

/** Marks the row `removing`, from whatever status it has now, and returns that status. */
async function markRemoving(hostname: string) {
  for (;;) {
    const current = await domainRow(hostname);
    if (!current) return null;
    const [row] = await db
      .update(hostnames)
      .set({ status: "removing" })
      .where(and(eq(hostnames.hostname, hostname), eq(hostnames.status, current.status)))
      .returning();
    if (row) return { row, was: current.status };
  }
}

async function domainRow(hostname: string) {
  const [row] = await db.select().from(hostnames).where(eq(hostnames.hostname, hostname));
  return row ?? null;
}

type Routing = { host: string | null; redirect: string | null };

/**
 * Writes the two keys dispatch routes by from the rows as they are now: `hostname` serves its
 * doc unless it is being removed, and the doc's address redirects to its active domain. It reads
 * the rows again after writing, so a change that wrote its own keys before this write landed is
 * written again with what the rows say now. The last write therefore always matches the rows.
 */
async function project(env: DomainsEnv, hostname: string, doc: DocRow) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const wanted = await routing(hostname, doc);
    await Promise.all([
      wanted.host === null
        ? env.DOMAINS.delete(hostKey(hostname))
        : env.DOMAINS.put(hostKey(hostname), wanted.host),
      wanted.redirect === null
        ? env.DOMAINS.delete(redirectKey(doc.slug))
        : env.DOMAINS.put(redirectKey(doc.slug), wanted.redirect),
    ]);
    const now = await routing(hostname, doc);
    if (now.host === wanted.host && now.redirect === wanted.redirect) return;
  }
  throw new Error(`the routing for ${hostname} kept changing`);
}

async function routing(hostname: string, doc: DocRow): Promise<Routing> {
  const [[served], [own]] = await Promise.all([
    db
      .select({ slug: docs.slug, status: hostnames.status })
      .from(hostnames)
      .innerJoin(docs, eq(docs.id, hostnames.docId))
      .where(eq(hostnames.hostname, hostname)),
    db.select().from(hostnames).where(eq(hostnames.docId, doc.id)),
  ]);
  return {
    host: served && served.status !== "removing" ? served.slug : null,
    redirect: activeHostname(own ?? null),
  };
}

/**
 * Builds the live target again when the domain moves the doc's URL, so its canonical URLs follow.
 * The build reads the URL from the database when it starts.
 */
async function rebuild(env: DomainsEnv, doc: DocRow, hostname: string) {
  if (docUrl(doc.slug, hostname, env) === docUrl(doc.slug, null, env)) return;
  const info = docInfo(doc);
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
