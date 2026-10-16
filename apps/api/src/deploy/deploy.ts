import { z } from "zod";

import type { ManifestEntry } from "../builder/protocol";

/** A Workers for Platforms dispatch namespace and a token that can write to it. */
export type DispatchAccount = { id: string; apiToken: string; namespace: string };

export type DeployStep = "upload-session" | "upload" | "script" | "delete";

export type CloudflareError = { code: number; message: string };

/** Cloudflare refused a request, or answered with something this code cannot use. */
export type CloudflareFailure<Step extends string> = {
  ok: false;
  step: Step;
  status: number;
  message: string;
  errors: CloudflareError[];
};

export type DeployFailure = CloudflareFailure<DeployStep>;

export type DeployResult = { ok: true; uploaded: number; reused: number } | DeployFailure;

/**
 * How the doc Worker is shaped. `assets-only` has no script, the way Wrangler
 * uploads a Worker without `main`. The docs only show dispatch namespace
 * Workers with a main module, so `assets-with-module` adds one that forwards
 * to `env.ASSETS` in case the live check finds assets-only is refused.
 */
export type DocWorkerShape = "assets-only" | "assets-with-module";

export const COMPATIBILITY_DATE = "2026-10-01";

export const CLOUDFLARE_API = "https://api.cloudflare.com/client/v4";

// Wrangler uploads three buckets at a time; Cloudflare sizes buckets to about 50 MiB.
const UPLOAD_CONCURRENCY = 3;

const MODULE_NAME = "worker.js";
const MODULE_SOURCE = "export default { fetch: (request, env) => env.ASSETS.fetch(request) };\n";

/**
 * Uploads a built doc's files and points `scriptName` at them. Files
 * Cloudflare already holds (by hash, across the namespace) are not sent again,
 * so running it twice with the same manifest uploads nothing the second time.
 * Transport errors and `readAsset` failures throw, so a Workflow step retries them.
 */
export async function deployDoc({
  account,
  scriptName,
  manifest,
  readAsset,
  shape = "assets-only",
  fetch = globalThis.fetch,
}: {
  account: DispatchAccount;
  scriptName: string;
  manifest: ManifestEntry[];
  readAsset: (path: string) => Promise<Uint8Array>;
  shape?: DocWorkerShape;
  fetch?: typeof globalThis.fetch;
}): Promise<DeployResult> {
  const { assets, configFiles } = splitManifest(manifest);
  const script = scriptUrl(account, scriptName);

  const session = await parseResponse(
    "upload-session",
    await fetch(`${script}/assets-upload-session`, {
      method: "POST",
      headers: { Authorization: `Bearer ${account.apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ manifest: assets }),
    }),
    z.object({ jwt: z.string().min(1), buckets: z.array(z.array(z.string())) }),
  );
  if (!session.ok) return session;

  const pathByHash = new Map(Object.entries(assets).map(([path, { hash }]) => [hash, path]));
  const buckets: { hash: string; path: string }[][] = [];
  for (const bucket of session.result.buckets) {
    const files = [];
    for (const hash of bucket) {
      const path = pathByHash.get(hash);
      if (path === undefined) {
        return failure(
          "upload-session",
          200,
          `Cloudflare asked for ${hash}, which is not in the manifest`,
        );
      }
      files.push({ hash, path });
    }
    if (files.length > 0) buckets.push(files);
  }

  const uploads = await uploadBuckets(buckets, async (bucket) =>
    parseResponse(
      "upload",
      await fetch(`${CLOUDFLARE_API}/accounts/${account.id}/workers/assets/upload?base64=true`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.result.jwt}` },
        body: await bucketForm(bucket, readAsset),
      }),
      z.object({ jwt: z.string().min(1).nullish() }).nullish(),
    ),
  );
  if (!uploads.ok) return uploads;

  const uploaded = buckets.flat().length;
  const completionJwt = uploaded === 0 ? session.result.jwt : uploads.jwt;
  if (completionJwt === undefined) {
    return failure("upload", uploads.status, "no upload returned a completion token");
  }

  const config: AssetsConfig = {
    html_handling: "auto-trailing-slash",
    not_found_handling: "404-page",
  };
  if (configFiles._headers) config._headers = await readText(readAsset, configFiles._headers);
  if (configFiles._redirects) config._redirects = await readText(readAsset, configFiles._redirects);

  const put = await parseResponse(
    "script",
    await fetch(script, {
      method: "PUT",
      headers: { Authorization: `Bearer ${account.apiToken}` },
      body: scriptForm(completionJwt, config, shape),
    }),
    z.unknown(),
  );
  if (!put.ok) return put;

  return { ok: true, uploaded, reused: Object.keys(assets).length - uploaded };
}

/** The bindings a deploy reads. */
export type DeployEnv = {
  ENVIRONMENT: string;
  DISPATCH_ACCOUNT_ID: string;
  DISPATCH_API_TOKEN: string;
  DISPATCH_NAMESPACE: string;
};

/**
 * Puts a finished build live at `scriptName` in the dispatch namespace.
 * Development sends nothing, because it has no dispatch namespace and serves builds from the
 * container. A refusal a retry cannot fix (4xx) comes back as an error for the dashboard. One a
 * retry may fix (5xx, 429, transport, `readAsset`) throws, so the Workflow step rebuilds and
 * deploys again.
 */
export async function deployBuild({
  env,
  scriptName,
  manifest,
  readAsset,
  fetch = globalThis.fetch,
}: {
  env: DeployEnv;
  scriptName: string;
  manifest: ManifestEntry[];
  readAsset: (path: string) => Promise<Uint8Array>;
  fetch?: typeof globalThis.fetch;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (env.ENVIRONMENT === "development") return { ok: true };
  // Skipping here would report a build as Live that nobody can reach.
  for (const name of ["DISPATCH_ACCOUNT_ID", "DISPATCH_API_TOKEN"] as const) {
    if (!env[name]) return { ok: false, error: `Deploying is not configured: ${name} is not set` };
  }

  const result = await deployDoc({
    account: {
      id: env.DISPATCH_ACCOUNT_ID,
      apiToken: env.DISPATCH_API_TOKEN,
      namespace: env.DISPATCH_NAMESPACE,
    },
    scriptName,
    manifest,
    readAsset,
    fetch,
  });
  if (result.ok) return { ok: true };
  const error = `Deploying failed at ${result.step} (HTTP ${result.status}): ${result.message}`;
  if (result.status >= 500 || result.status === 429) throw new Error(error);
  return { ok: false, error };
}

/** Deletes a doc Worker. A Worker that is already gone counts as deleted. */
export async function deleteDoc({
  account,
  scriptName,
  fetch = globalThis.fetch,
}: {
  account: DispatchAccount;
  scriptName: string;
  fetch?: typeof globalThis.fetch;
}): Promise<{ ok: true } | DeployFailure> {
  const response = await fetch(scriptUrl(account, scriptName), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${account.apiToken}` },
  });
  if (response.status === 404) return { ok: true };
  const parsed = await parseResponse("delete", response, z.unknown());
  return parsed.ok ? { ok: true } : parsed;
}

export type ApiManifest = Record<string, { hash: string; size: number }>;

// Workers reads these two from the assets config, never serves them as files.
const CONFIG_FILES = ["_headers", "_redirects"] as const;
type ConfigFile = (typeof CONFIG_FILES)[number];

/**
 * Splits a build manifest into the files to upload and the `_headers` and
 * `_redirects` files at the root, which go in the script's assets config.
 */
export function splitManifest(manifest: ManifestEntry[]): {
  assets: ApiManifest;
  configFiles: Partial<Record<ConfigFile, string>>;
} {
  const assets: ApiManifest = {};
  const configFiles: Partial<Record<ConfigFile, string>> = {};
  for (const { path, hash, size } of manifest) {
    const name = CONFIG_FILES.find((file) => path === `/${file}`);
    if (name) configFiles[name] = path;
    else assets[path] = { hash, size };
  }
  return { assets, configFiles };
}

type AssetsConfig = {
  html_handling: "auto-trailing-slash";
  not_found_handling: "404-page";
  _headers?: string;
  _redirects?: string;
};

/** The multipart body of the script PUT. */
export function scriptForm(jwt: string, config: AssetsConfig, shape: DocWorkerShape): FormData {
  const form = new FormData();
  const metadata = { assets: { jwt, config }, compatibility_date: COMPATIBILITY_DATE };
  if (shape === "assets-only") {
    form.set("metadata", JSON.stringify(metadata));
    return form;
  }
  form.set(
    "metadata",
    JSON.stringify({
      ...metadata,
      main_module: MODULE_NAME,
      bindings: [{ type: "assets", name: "ASSETS" }],
    }),
  );
  form.set(
    MODULE_NAME,
    new Blob([MODULE_SOURCE], { type: "application/javascript+module" }),
    MODULE_NAME,
  );
  return form;
}

async function bucketForm(
  bucket: { hash: string; path: string }[],
  readAsset: (path: string) => Promise<Uint8Array>,
): Promise<FormData> {
  const form = new FormData();
  for (const { hash, path } of bucket) {
    const base64 = toBase64(await readAsset(path));
    form.append(hash, new Blob([base64], { type: contentType(path) }), hash);
  }
  return form;
}

type Uploaded = { ok: true; status: number; result: { jwt?: string | null } | null | undefined };

/** Uploads every bucket, a few at a time, and keeps the completion token one of them returns. */
async function uploadBuckets<B>(
  buckets: B[],
  upload: (bucket: B) => Promise<Uploaded | DeployFailure>,
): Promise<{ ok: true; jwt: string | undefined; status: number } | DeployFailure> {
  const queue = [...buckets];
  let jwt: string | undefined;
  let status = 0;
  let failed: DeployFailure | undefined;
  const worker = async () => {
    for (let bucket = queue.shift(); bucket && !failed; bucket = queue.shift()) {
      const response = await upload(bucket);
      if (!response.ok) {
        failed ??= response;
      } else {
        jwt = response.result?.jwt ?? jwt;
        status = response.status;
      }
    }
  };
  await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, worker));
  return failed ?? { ok: true, jwt, status };
}

const errorsSchema = z.array(z.object({ code: z.number(), message: z.string() }));

/** Reads Cloudflare's `{ success, errors, result }` envelope into a typed result or a failure. */
export async function parseResponse<T, Step extends string>(
  step: Step,
  response: Response,
  result: z.ZodType<T>,
): Promise<{ ok: true; status: number; result: T } | CloudflareFailure<Step>> {
  const text = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {}
  const envelope = z
    .object({ success: z.boolean(), errors: errorsSchema.catch([]), result: result })
    .safeParse(body);

  if (response.ok && envelope.success && envelope.data.success) {
    return { ok: true, status: response.status, result: envelope.data.result };
  }
  const errors = z.object({ errors: errorsSchema }).safeParse(body).data?.errors ?? [];
  if (errors.length > 0) {
    const message = errors.map(({ code, message }) => `${message} (${code})`).join("; ");
    return failure(step, response.status, message, errors);
  }
  const detail = text.trim().slice(0, 500);
  return failure(
    step,
    response.status,
    response.ok
      ? `unexpected response: ${detail}`
      : `HTTP ${response.status}${detail ? `: ${detail}` : ""}`,
  );
}

function failure<Step extends string>(
  step: Step,
  status: number,
  message: string,
  errors: CloudflareError[] = [],
): CloudflareFailure<Step> {
  return { ok: false, step, status, message, errors };
}

function scriptUrl(account: DispatchAccount, scriptName: string) {
  return `${CLOUDFLARE_API}/accounts/${account.id}/workers/dispatch/namespaces/${account.namespace}/scripts/${scriptName}`;
}

async function readText(readAsset: (path: string) => Promise<Uint8Array>, path: string) {
  return new TextDecoder().decode(await readAsset(path));
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  // Spread in chunks: one argument per byte overflows the stack on large files.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

// Cloudflare serves each file with the Content-Type of its upload part.
const CONTENT_TYPES: Record<string, string> = {
  avif: "image/avif",
  css: "text/css; charset=utf-8",
  gif: "image/gif",
  html: "text/html; charset=utf-8",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript; charset=utf-8",
  json: "application/json",
  map: "application/json",
  md: "text/markdown; charset=utf-8",
  mdx: "text/markdown; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  otf: "font/otf",
  pdf: "application/pdf",
  png: "image/png",
  svg: "image/svg+xml",
  ttf: "font/ttf",
  txt: "text/plain; charset=utf-8",
  wasm: "application/wasm",
  webmanifest: "application/manifest+json",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xml: "application/xml",
};

export function contentType(path: string): string {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  const extension = dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}
