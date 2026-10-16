import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { docs } from "../schema/docs";
import { db } from "../utils/db";
import type { Doc } from "./doc";
import type { DocPath } from "./drafts";

/**
 * Where a doc is served, for the dashboard's links and for the build's canonical URLs. In
 * development the dispatch Worker serves `<slug>.docs.localhost` on port 3003.
 */
export function docUrl(slug: string) {
  return env.ENVIRONMENT === "development"
    ? `http://${slug}.${env.DOCS_DOMAIN}:3003`
    : `https://${slug}.${env.DOCS_DOMAIN}`;
}

export function withUrl<T extends { slug: string }>(doc: T) {
  return { ...doc, url: docUrl(doc.slug) };
}

/** A draft's text, as the editor and agents send it. */
export const DraftContent = z.string().max(1_000_000);

// The binding names this Worker by string, so cf/config cannot infer the class.
const docObjects = () => env.DOCS as DurableObjectNamespace<Doc>;

/** The doc's Doc, or null when the organization has no such doc. */
export async function openDoc(organizationId: string, docId: string) {
  const [doc] = await db
    .select()
    .from(docs)
    .where(and(eq(docs.id, docId), eq(docs.organizationId, organizationId)));
  // Connected GitHub sources have no editor yet.
  if (!doc || doc.source.kind !== "managed") return null;
  const stub = docObjects().getByName(doc.id);
  await stub.init({
    docId: doc.id,
    slug: doc.slug,
    name: doc.name,
    repo: doc.source.artifactsRepo,
    docUrl: docUrl(doc.slug),
  });
  return stub;
}

export type OpenDoc = NonNullable<Awaited<ReturnType<typeof openDoc>>>;

type Author = { name: string; email: string };

const author = (user: Author) => ({ name: user.name, email: user.email });

/** A file's text: the draft if there is one, otherwise the published version. */
export async function readText(doc: OpenDoc, path: DocPath) {
  const file = await doc.getFile(path);
  if (file.kind === "not_found") return file;
  try {
    const content = new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(
      file.content,
    );
    return { kind: "text" as const, content };
  } catch {
    return { kind: "not_text" as const };
  }
}

export const saveText = (doc: OpenDoc, path: DocPath, content: string, user: Author) =>
  doc.saveDraft(path, new TextEncoder().encode(content), author(user));

export const deleteFile = (doc: OpenDoc, path: DocPath, user: Author) =>
  doc.deleteFile(path, author(user));

export const publish = (doc: OpenDoc, user: Author) => doc.publish(author(user));
