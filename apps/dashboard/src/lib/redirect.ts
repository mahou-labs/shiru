import { z } from "zod";

export const redirectSearch = z.object({
  redirect: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional()
    .catch(undefined),
});

export function callbackURL(path = "/") {
  return new URL(path, window.location.origin).href;
}

/**
 * The API sends an agent's authorization request to sign-in and consent with a signed query.
 * Requests sent from such a page carry it back, so the API can resume that authorization.
 */
export function isOAuthRequest(search: string) {
  return new URLSearchParams(search).has("sig");
}
