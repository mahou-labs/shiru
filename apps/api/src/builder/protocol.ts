import { z } from "zod";

/** A file of one commit, at its path from the repository root. */
export type SourceFile = { path: string; content: Uint8Array | string };

/** One built file. `path` is the URL path, `hash` is 32 hex characters. */
export type ManifestEntry = { path: string; size: number; hash: string };

export type BuildResult =
  | { ok: true; templateVersion: string; manifest: ManifestEntry[] }
  | { ok: false; errors: string[] };

export const BUILD_TIMEOUT_SECONDS = 300;

/** A Workflow step result is capped at 1 MiB; leave room for the step's own framing. */
export const MAX_RESULT_BYTES = 1_000_000;

const MAX_ERRORS = 50;
const MAX_ERROR_LENGTH = 4000;

/**
 * Why `path` is not a safe relative path, or undefined when it is. Paths come
 * from a client's repository and are written into the container under /work/src.
 */
export function sourcePathError(path: string): string | undefined {
  if (path.length === 0 || path.length > 1024)
    return `${JSON.stringify(path)} is empty or too long`;
  if (path.startsWith("/")) return `${path} must be relative`;
  return segmentsError(path.split("/"), path);
}

/** The absolute directory build-site reads, from a doc's `docsRoot` ("" or "." for the repository root). */
export function sourceDir(docsRoot: string): string | { error: string } {
  const root = docsRoot.replace(/\/+$/, "");
  if (root === "" || root === ".") return "/work/src";
  const error = sourcePathError(root);
  return error ? { error: `docsRoot ${error}` } : `/work/src/${root}`;
}

/** Whether `path` is a URL path of a built file that may be read back out of the container. */
export function isAssetPath(path: string): boolean {
  return path.startsWith("/") && segmentsError(path.slice(1).split("/"), path) === undefined;
}

function segmentsError(segments: string[], path: string): string | undefined {
  for (const segment of segments) {
    if (segment === "" || segment === "." || segment === "..") {
      return `${path} has an empty, . or .. segment`;
    }
    // oxlint-disable-next-line no-control-regex
    if (/[\\\u0000-\u001f\u007f]/.test(segment)) {
      return `${path} has a backslash or a control character`;
    }
  }
  return undefined;
}

const resultLine = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), templateVersion: z.string().min(1) }),
  z.object({ ok: z.literal(false), errors: z.array(z.string()).min(1) }),
]);

/**
 * Reads what `timeout … build-site` left behind. The last stdout line is the
 * result; anything else (a crash, a timeout, a malformed line) becomes an error.
 */
export function parseBuildSiteOutput(
  exitCode: number,
  stdout: string,
  stderr: string,
): { ok: true; templateVersion: string } | { ok: false; errors: string[] } {
  if (exitCode === 124) {
    return { ok: false, errors: [`the build took longer than ${BUILD_TIMEOUT_SECONDS} seconds`] };
  }
  const last = stdout.trimEnd().split("\n").at(-1) ?? "";
  let parsed: z.infer<typeof resultLine> | undefined;
  try {
    parsed = resultLine.safeParse(JSON.parse(last)).data;
  } catch {}
  if (parsed?.ok === true && exitCode === 0) return parsed;
  if (parsed?.ok === false) return { ok: false, errors: capErrors(parsed.errors) };
  const tail = stderr.trim().slice(-MAX_ERROR_LENGTH);
  return {
    ok: false,
    errors: [`build-site exited with code ${exitCode} and no result${tail ? `:\n${tail}` : ""}`],
  };
}

function capErrors(errors: string[]): string[] {
  const kept = errors.slice(0, MAX_ERRORS).map((error) => error.slice(0, MAX_ERROR_LENGTH));
  if (errors.length > MAX_ERRORS) kept.push(`and ${errors.length - MAX_ERRORS} more errors`);
  return kept;
}

const manifestSchema = z.array(
  z.strictObject({
    path: z.string().refine(isAssetPath),
    size: z.number().int().nonnegative(),
    hash: z.string().regex(/^[0-9a-f]{32}$/),
  }),
);

/**
 * Turns `dist-manifest` output into the build result. The container runs
 * client code, so its output is checked like any other untrusted input.
 */
export function manifestResult(
  templateVersion: string,
  exitCode: number,
  stdout: string,
): BuildResult {
  let manifest: ManifestEntry[] | undefined;
  try {
    manifest = exitCode === 0 ? manifestSchema.safeParse(JSON.parse(stdout)).data : undefined;
  } catch {}
  if (!manifest) return { ok: false, errors: ["the build output could not be listed"] };

  const result: BuildResult = { ok: true, templateVersion, manifest };
  const bytes = new TextEncoder().encode(JSON.stringify(result)).length;
  if (bytes > MAX_RESULT_BYTES) {
    return {
      ok: false,
      errors: [`the site built ${manifest.length} files, more than one publish can deploy`],
    };
  }
  return result;
}
