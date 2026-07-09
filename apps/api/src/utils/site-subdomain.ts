import * as z from "zod";

const reservedSubdomains = new Set(["app", "api", "docs", "t", "www"]);
const dnsLabel = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export const siteSubdomainSchema = z
  .string()
  .regex(dnsLabel, "Site Subdomain must be a lowercase DNS label")
  .refine((subdomain) => !reservedSubdomains.has(subdomain), "Site Subdomain is reserved");

export function isSiteSubdomain(value: string) {
  return siteSubdomainSchema.safeParse(value).success;
}
