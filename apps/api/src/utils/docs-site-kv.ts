import { env } from "cloudflare:workers";

import { log } from "@/utils/logger";

export type DocsSiteKvRecord = {
  activeCommitSha: string;
  storagePrefix: string;
};

const placeholderStoragePrefix = "storage_prefix";

export function getDocsSiteKvKey(slug: string) {
  return `docs:site:${slug}`;
}

export function resolveDocsSiteStoragePrefix(
  storagePrefix: string | null | undefined,
  slug: string,
) {
  if (!storagePrefix || storagePrefix === placeholderStoragePrefix) {
    return slug;
  }

  return storagePrefix;
}

export async function syncDocsSiteKv(slug: string, record: DocsSiteKvRecord | null) {
  const key = getDocsSiteKvKey(slug);

  try {
    if (record) {
      await env.DOCS_KV.put(key, JSON.stringify(record));
      return;
    }

    await env.DOCS_KV.delete(key);
  } catch (error) {
    log.error("docs_site_kv.sync_failed", error, { key, slug, action: record ? "put" : "delete" });
  }
}
