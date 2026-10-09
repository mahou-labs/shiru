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
