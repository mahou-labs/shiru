import { z } from "zod";

/**
 * Signed grants that let a signed-in member reach a preview host, which the dashboard's session
 * cookie never reaches. The API signs a short `handoff` grant after checking membership, and the
 * dispatch Worker trades it for a `session` grant in a cookie scoped to that one host. Both Workers
 * import this module, so it uses WebCrypto only.
 */
export type Grant = { kind: "handoff" | "session"; host: string; exp: number };

export const HANDOFF_TTL_MS = 60_000;
export const SESSION_TTL_MS = 60 * 60_000;
export const PREVIEW_COOKIE = "__Host-shiru-preview";
export const HANDOFF_PATH = "/__shiru/preview-auth";

const grantSchema = z.object({
  kind: z.enum(["handoff", "session"]),
  host: z.string(),
  exp: z.number(),
});

const encoder = new TextEncoder();

export async function signGrant(grant: Grant, secret: string): Promise<string> {
  const payload = toBase64Url(encoder.encode(JSON.stringify(grant)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Whether `token` is an untampered, unexpired grant of `kind` for `host`. */
export async function verifyGrant(
  token: string,
  expected: { kind: Grant["kind"]; host: string; now: number; secret: string },
): Promise<boolean> {
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return false;
  const signatureBytes = fromBase64Url(signature);
  const payloadBytes = fromBase64Url(payload);
  if (!signatureBytes || !payloadBytes) return false;
  // `verify` compares in constant time, unlike comparing two signatures as strings.
  const valid = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(expected.secret),
    signatureBytes,
    encoder.encode(payload),
  );
  if (!valid) return false;

  let grant;
  try {
    grant = grantSchema.safeParse(JSON.parse(new TextDecoder().decode(payloadBytes)));
  } catch {
    return false;
  }
  return (
    grant.success &&
    grant.data.kind === expected.kind &&
    grant.data.host === expected.host &&
    grant.data.exp > expected.now
  );
}

/** A path on the same host to send the visitor to: never `//host` or `/\host`, which leave it. */
export function safePath(path: string | undefined): string {
  if (!path?.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return "/";
  return path;
}

function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return null;
  try {
    const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}
