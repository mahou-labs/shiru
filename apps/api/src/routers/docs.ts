import { env } from "cloudflare:workers";
import { and, asc, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";

import { docs } from "../schema/docs";
import { DocPath } from "../docs/drafts";
import { DocSlug } from "../docs/names";
import {
  deleteFile,
  DraftContent,
  openDoc,
  publish,
  readText,
  saveText,
  withUrl,
} from "../docs/service";
import { db } from "../utils/db";
import { organizationProcedure, paidProcedure } from "../utils/orpc";

export { docUrl } from "../docs/service";

const DOC_ERRORS = { NOT_FOUND: { status: 404, message: "Site not found" } } as const;
const FILE_ERRORS = { FILE_NOT_FOUND: { status: 404, message: "File not found" } } as const;

const docInput = z.object({ docId: z.string() });
const fileInput = docInput.extend({ path: DocPath });

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
      const file = await readText(doc, input.path);
      if (file.kind === "not_found") throw errors.FILE_NOT_FOUND();
      if (file.kind === "not_text") throw errors.NOT_TEXT();
      return { path: input.path, content: file.content };
    }),
  /** Saves a draft. Nothing reaches the doc until `docs.publish`. */
  save: paidProcedure
    .errors(DOC_ERRORS)
    .input(fileInput.extend({ content: DraftContent }))
    .handler(async ({ context, input, errors }) => {
      const doc = await openDoc(context.organizationId, input.docId);
      if (!doc) throw errors.NOT_FOUND();
      return saveText(doc, input.path, input.content, context.user);
    }),
  /** Records a delete draft, or drops the draft of a file that was never published. */
  delete: paidProcedure
    .errors({ ...DOC_ERRORS, ...FILE_ERRORS })
    .input(fileInput)
    .handler(async ({ context, input, errors }) => {
      const doc = await openDoc(context.organizationId, input.docId);
      if (!doc) throw errors.NOT_FOUND();
      const outcome = await deleteFile(doc, input.path, context.user);
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
      if (doc) return withUrl(doc);

      // The insert skips any unique conflict, so read back which one it hit. A public doc wins
      // because no other address would fix it.
      const [publicDoc] = await db
        .select({ id: docs.id })
        .from(docs)
        .where(and(eq(docs.organizationId, context.organizationId), eq(docs.visibility, "public")));
      throw publicDoc ? errors.PUBLIC_DOC_EXISTS() : errors.SLUG_TAKEN();
    }),
  list: organizationProcedure.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(docs)
      .where(eq(docs.organizationId, context.organizationId))
      .orderBy(asc(docs.createdAt), asc(docs.id));
    return rows.map(withUrl);
  }),
  checkSlug: organizationProcedure.input(z.object({ slug: DocSlug })).handler(async ({ input }) => {
    const [taken] = await db.select({ id: docs.id }).from(docs).where(eq(docs.slug, input.slug));
    return { available: !taken };
  }),
  docsDomain: organizationProcedure.handler(() => env.DOCS_DOMAIN),
  files: filesRouter,
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
      const result = await publish(doc, context.user);
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
