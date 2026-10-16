import { env } from "cloudflare:workers";
import { and, asc, eq, type SQL } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";

import { docs, hostnames } from "../schema/docs";
import { DocPath } from "../docs/drafts";
import type { Doc } from "../docs/doc";
import { CustomHostname, DocSlug, parseHostname } from "../docs/names";
import {
  activeHostname,
  addDomain,
  docInfo,
  docUrl,
  type DocRow,
  type DomainRow,
  refreshDomain,
  removeDomain,
  toDomain,
} from "../domains/domains";
import { db } from "../utils/db";
import { organizationProcedure, paidProcedure } from "../utils/orpc";

function withUrl(doc: DocRow, domain: DomainRow | null) {
  return { ...doc, url: docUrl(doc.slug, activeHostname(domain), env) };
}

/** Docs with their custom domains, oldest first. */
function selectDocs(where: SQL | undefined) {
  return db
    .select({ doc: docs, domain: hostnames })
    .from(docs)
    .leftJoin(hostnames, eq(hostnames.docId, docs.id))
    .where(where)
    .orderBy(asc(docs.createdAt), asc(docs.id));
}

/** The doc and its custom domain, or undefined when the organization has no such doc. */
async function findDoc(organizationId: string, docId: string) {
  const [found] = await selectDocs(
    and(eq(docs.id, docId), eq(docs.organizationId, organizationId)),
  );
  return found;
}

const DOC_ERRORS = { NOT_FOUND: { status: 404, message: "Site not found" } } as const;
const FILE_ERRORS = { FILE_NOT_FOUND: { status: 404, message: "File not found" } } as const;

const docInput = z.object({ docId: z.string() });
const fileInput = docInput.extend({ path: DocPath });

// The binding names this Worker by string, so cf/config cannot infer the class.
const docObjects = () => env.DOCS as DurableObjectNamespace<Doc>;

/** The doc's Doc, or null when the organization has no such doc. */
async function openDoc(organizationId: string, docId: string) {
  const found = await findDoc(organizationId, docId);
  if (!found) return null;
  // Connected GitHub sources have no editor yet.
  const info = docInfo(found.doc);
  if (!info) return null;
  const stub = docObjects().getByName(info.docId);
  await stub.init(info);
  return stub;
}

const author = (user: { name: string; email: string }) => ({ name: user.name, email: user.email });

/** Editing a managed doc's files. Paths are relative to the doc's docs root. */
const filesRouter = {
  /** Every file with its draft state: unchanged, added, modified or deleted. */
  tree: organizationProcedure
    .errors(DOC_ERRORS)
    .input(docInput)
    .handler(async ({ context, input, errors }) => {
      const doc = await openDoc(context.organizationId, input.docId);
      if (!doc) throw errors.NOT_FOUND();
      return { files: await doc.getTree() };
    }),
  /** A file's text: the draft if there is one, otherwise the published version. */
  get: organizationProcedure
    .errors({
      ...DOC_ERRORS,
      ...FILE_ERRORS,
      NOT_TEXT: { status: 415, message: "This file is not text" },
    })
    .input(fileInput)
    .handler(async ({ context, input, errors }) => {
      const doc = await openDoc(context.organizationId, input.docId);
      if (!doc) throw errors.NOT_FOUND();
      const file = await doc.getFile(input.path);
      if (file.kind === "not_found") throw errors.FILE_NOT_FOUND();
      try {
        return {
          path: input.path,
          content: new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(file.content),
        };
      } catch {
        throw errors.NOT_TEXT();
      }
    }),
  /** Saves a draft. Nothing reaches the doc until `docs.publish`. */
  save: paidProcedure
    .errors(DOC_ERRORS)
    .input(fileInput.extend({ content: z.string().max(1_000_000) }))
    .handler(async ({ context, input, errors }) => {
      const doc = await openDoc(context.organizationId, input.docId);
      if (!doc) throw errors.NOT_FOUND();
      const content = new TextEncoder().encode(input.content);
      return doc.saveDraft(input.path, content, author(context.user));
    }),
  /** Records a delete draft, or drops the draft of a file that was never published. */
  delete: paidProcedure
    .errors({ ...DOC_ERRORS, ...FILE_ERRORS })
    .input(fileInput)
    .handler(async ({ context, input, errors }) => {
      const doc = await openDoc(context.organizationId, input.docId);
      if (!doc) throw errors.NOT_FOUND();
      const outcome = await doc.deleteFile(input.path, author(context.user));
      if (outcome.kind === "not_found") throw errors.FILE_NOT_FOUND();
      return { path: input.path, deleted: true as const };
    }),
  /** Throws away a file's draft, back to the published version. */
  discard: paidProcedure
    .errors({ ...DOC_ERRORS, ...FILE_ERRORS })
    .input(fileInput)
    .handler(async ({ context, input, errors }) => {
      const doc = await openDoc(context.organizationId, input.docId);
      if (!doc) throw errors.NOT_FOUND();
      const outcome = await doc.discardDraft(input.path);
      if (outcome.kind === "not_found") throw errors.FILE_NOT_FOUND();
      return { path: input.path, discarded: true as const };
    }),
};

const DOMAIN_ERRORS = {
  DOMAIN_EXISTS: { status: 409, message: "This site already has a custom domain" },
  HOSTNAME_TAKEN: { status: 409, message: "Another site already uses this domain" },
  HOSTNAME_NOT_ALLOWED: { status: 400, message: "This domain is already a Shiru address" },
  HOSTNAME_REJECTED: {
    status: 422,
    message: "Cloudflare refused this domain",
    data: z.object({ message: z.string() }),
  },
  NOT_CONFIGURED: { status: 503, message: "Custom domains are not available right now" },
} as const;

/** One custom domain per doc, served once its CNAME points at Shiru. */
const domainRouter = {
  /** The doc's custom domain, synced with Cloudflare while it is not active yet. */
  get: organizationProcedure
    .errors({ ...DOC_ERRORS, NOT_CONFIGURED: DOMAIN_ERRORS.NOT_CONFIGURED })
    .input(docInput)
    .handler(async ({ context, input, errors }) => {
      const found = await findDoc(context.organizationId, input.docId);
      if (!found) throw errors.NOT_FOUND();
      const { doc, domain } = found;
      if (!domain) return null;
      if (domain.status === "active") return toDomain(domain, [], env);
      const result = await refreshDomain({ env, doc, row: domain });
      if (!result.ok) throw errors.NOT_CONFIGURED({ message: result.error.message });
      return result.domain;
    }),
  add: paidProcedure
    .errors({ ...DOC_ERRORS, ...DOMAIN_ERRORS })
    .input(docInput.extend({ hostname: CustomHostname }))
    .handler(async ({ context, input, errors }) => {
      const domains = { docs: env.DOCS_DOMAIN, preview: `preview.${env.DOCS_DOMAIN}` };
      if (parseHostname(input.hostname, domains).kind !== "custom") {
        throw errors.HOSTNAME_NOT_ALLOWED();
      }
      const found = await findDoc(context.organizationId, input.docId);
      if (!found) throw errors.NOT_FOUND();
      const result = await addDomain({ env, doc: found.doc, hostname: input.hostname });
      if (result.ok) return result.domain;
      switch (result.error.code) {
        case "DOMAIN_EXISTS":
          throw errors.DOMAIN_EXISTS();
        case "HOSTNAME_TAKEN":
          throw errors.HOSTNAME_TAKEN();
        case "HOSTNAME_REJECTED":
          throw errors.HOSTNAME_REJECTED({ data: { message: result.error.message } });
        case "NOT_CONFIGURED":
          throw errors.NOT_CONFIGURED({ message: result.error.message });
      }
    }),
  remove: organizationProcedure
    .errors({ ...DOC_ERRORS, NOT_CONFIGURED: DOMAIN_ERRORS.NOT_CONFIGURED })
    .input(docInput)
    .handler(async ({ context, input, errors }) => {
      const found = await findDoc(context.organizationId, input.docId);
      if (!found) throw errors.NOT_FOUND();
      const { doc, domain } = found;
      if (domain) {
        const result = await removeDomain({ env, doc, row: domain });
        if (!result.ok) throw errors.NOT_CONFIGURED({ message: result.error.message });
      }
      return { removed: true as const };
    }),
};

export const docsRouter = {
  create: paidProcedure
    .errors({
      SLUG_TAKEN: { status: 409, message: "Another site already uses this address" },
      PUBLIC_DOC_EXISTS: {
        status: 409,
        message: "This organization already has a public docs site",
      },
    })
    .input(
      z.object({
        slug: DocSlug,
        name: z.string().trim().min(1).max(100),
        visibility: z.literal("public"),
      }),
    )
    .handler(async ({ context, input, errors }) => {
      const id = uuidv7();
      const [doc] = await db
        .insert(docs)
        .values({
          id,
          organizationId: context.organizationId,
          slug: input.slug,
          name: input.name,
          visibility: input.visibility,
          // Keyed by id, not slug, so renaming a doc never moves its repo.
          source: { kind: "managed", artifactsRepo: id },
          createdAt: new Date(),
        })
        .onConflictDoNothing()
        .returning();
      if (doc) return withUrl(doc, null);

      // The insert skips any unique conflict, so read back which one it hit. A public doc wins
      // because no other address would fix it.
      const [publicDoc] = await db
        .select({ id: docs.id })
        .from(docs)
        .where(and(eq(docs.organizationId, context.organizationId), eq(docs.visibility, "public")));
      throw publicDoc ? errors.PUBLIC_DOC_EXISTS() : errors.SLUG_TAKEN();
    }),
  list: organizationProcedure.handler(async ({ context }) => {
    const rows = await selectDocs(eq(docs.organizationId, context.organizationId));
    return rows.map(({ doc, domain }) => withUrl(doc, domain));
  }),
  checkSlug: organizationProcedure.input(z.object({ slug: DocSlug })).handler(async ({ input }) => {
    const [taken] = await db.select({ id: docs.id }).from(docs).where(eq(docs.slug, input.slug));
    return { available: !taken };
  }),
  docsDomain: organizationProcedure.handler(() => env.DOCS_DOMAIN),
  files: filesRouter,
  domain: domainRouter,
  /**
   * Commits every draft not in conflict and builds the commit on the live target. Conflicted
   * drafts stay and come back in `skipped`. `unchanged` means there was nothing to commit.
   */
  publish: paidProcedure
    .errors({
      ...DOC_ERRORS,
      CONFLICT: { status: 409, message: "The site kept changing while publishing. Try again." },
    })
    .input(docInput)
    .handler(async ({ context, input, errors }) => {
      const doc = await openDoc(context.organizationId, input.docId);
      if (!doc) throw errors.NOT_FOUND();
      const result = await doc.publish(author(context.user));
      if (result.kind === "conflict") throw errors.CONFLICT();
      return result;
    }),
  /** Head commit, per-target build state and unpublished drafts. */
  status: organizationProcedure
    .errors(DOC_ERRORS)
    .input(docInput)
    .handler(async ({ context, input, errors }) => {
      const doc = await openDoc(context.organizationId, input.docId);
      if (!doc) throw errors.NOT_FOUND();
      return doc.status();
    }),
};
