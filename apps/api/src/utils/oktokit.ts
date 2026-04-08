import { createAppAuth } from "@octokit/auth-app";
import { env } from "cloudflare:workers";
import { Octokit } from "octokit";

// Installation-level client (acts as the bot on specific repos)
export function getInstallationOctokit(installationId: number) {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.GITHUB_APP_ID,
      privateKey: atob(env.GITHUB_APP_PRIVATE_KEY),
      installationId,
    },
  });
}

export async function verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
  const secret = env.GITHUB_WEBHOOK_SECRET;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expected = `sha256=${Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;

  // Constant-time comparison
  if (expected.length !== signature.length) return false;

  const a = encoder.encode(expected);
  const b = encoder.encode(signature);
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a[i] ^ b[i];
  }

  return mismatch === 0;
}
