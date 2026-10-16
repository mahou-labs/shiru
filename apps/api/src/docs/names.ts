import { z } from "zod";

// Neither a slug nor a label can contain `--`, so `--` always separates a label from its doc.
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// `preview` is reserved too: a doc there could set cookies for every preview host under it.
// `cname` is the target custom domains point their CNAME at.
const RESERVED_SLUGS: readonly string[] = ["app", "api", "cname", "docs", "preview", "t", "www"];

export const DocSlug = z
  .string()
  .max(40)
  .regex(NAME, "Use lowercase letters, digits and single hyphens")
  .refine((slug) => !RESERVED_SLUGS.includes(slug), "This address is reserved")
  .brand<"DocSlug">();
export type DocSlug = z.infer<typeof DocSlug>;

export const TargetLabel = z
  .string()
  .max(20)
  .regex(NAME, "Use lowercase letters, digits and single hyphens")
  .brand<"TargetLabel">();
export type TargetLabel = z.infer<typeof TargetLabel>;

export const LIVE = TargetLabel.parse("live");
/** The editor's unpublished drafts, built by the Preview button. */
export const DRAFT = TargetLabel.parse("draft");

const HOST_LABEL = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
// Every name under shiru.page is a site's address. Under shiru.sh only the hosts Shiru serves are
// refused: a custom hostname goes live only once its DNS points at Shiru, so any other name there
// is safe to register, and Shiru serves its own docs at one.
const SHIRU_ZONES = ["shiru.page"];
const SHIRU_HOSTS = ["shiru.sh", "www.shiru.sh", "app.shiru.sh", "api.shiru.sh"];

const belongsToShiru = (hostname: string) =>
  SHIRU_HOSTS.includes(hostname) ||
  SHIRU_ZONES.some((zone) => hostname === zone || hostname.endsWith(`.${zone}`));

function isHostname(hostname: string) {
  const labels = hostname.split(".");
  const tld = labels.at(-1)!;
  return (
    labels.length >= 2 &&
    labels.every((label) => HOST_LABEL.test(label)) &&
    (/^[a-z]{2,}$/.test(tld) || tld.startsWith("xn--"))
  );
}

/** A domain an organization serves its docs at, such as `docs.acme.com`. */
export const CustomHostname = z
  .string()
  .trim()
  .toLowerCase()
  .transform((hostname) => hostname.replace(/\.$/, ""))
  .pipe(
    z
      .string()
      .max(253)
      .refine(isHostname, { message: "Enter a domain like docs.example.com", abort: true })
      .refine((hostname) => !belongsToShiru(hostname), "This domain belongs to Shiru"),
  )
  .brand<"CustomHostname">();
export type CustomHostname = z.infer<typeof CustomHostname>;

/** The KV key both Workers use for a custom hostname. Its value is the doc's slug. */
export const hostKey = (hostname: string) => `host:${hostname}`;

/** The KV key both Workers use for a doc's active custom hostname, which its slug redirects to. */
export const redirectKey = (slug: DocSlug) => `redirect:${slug}`;

export function workerName(doc: DocSlug, target: TargetLabel) {
  return target === LIVE ? doc : `${doc}--${target}`;
}

/** The inverse of `workerName`, or null for a name it never returns. */
export function parseWorkerName(name: string): { slug: DocSlug; target: TargetLabel } | null {
  const [slug, label, ...rest] = name.split("--");
  const parsedSlug = DocSlug.safeParse(slug);
  if (rest.length > 0 || !parsedSlug.success) return null;
  if (label === undefined) return { slug: parsedSlug.data, target: LIVE };
  const parsedLabel = TargetLabel.safeParse(label);
  // The live target is named after the doc alone, never `<slug>--live`.
  if (!parsedLabel.success || parsedLabel.data === LIVE) return null;
  return { slug: parsedSlug.data, target: parsedLabel.data };
}

export type DocsDomains = { docs: string; preview: string };

export type ParsedHostname =
  | { kind: "doc"; slug: DocSlug }
  | { kind: "preview"; slug: DocSlug; label: TargetLabel }
  | { kind: "custom"; hostname: string }
  | { kind: "invalid" };

export function parseHostname(host: string, domains: DocsDomains): ParsedHostname {
  const hostname = host.toLowerCase().replace(/\.$/, "");

  const preview = subdomain(hostname, domains.preview);
  if (preview !== null) {
    const [label, slug, ...rest] = preview.split("--");
    const parsedLabel = TargetLabel.safeParse(label);
    const parsedSlug = DocSlug.safeParse(slug);
    if (rest.length > 0 || !parsedLabel.success || !parsedSlug.success) return { kind: "invalid" };
    // The live target is served at the doc's own hostname, never as a preview.
    if (parsedLabel.data === LIVE) return { kind: "invalid" };
    return { kind: "preview", slug: parsedSlug.data, label: parsedLabel.data };
  }

  const doc = subdomain(hostname, domains.docs);
  if (doc !== null) {
    const parsedSlug = DocSlug.safeParse(doc);
    return parsedSlug.success ? { kind: "doc", slug: parsedSlug.data } : { kind: "invalid" };
  }

  return { kind: "custom", hostname };
}

// The single label directly under `domain`, or null when `hostname` is not under it. A deeper
// name (`a.b.domain`) or the bare domain returns "" or a dotted string, which no parser accepts.
function subdomain(hostname: string, domain: string) {
  if (hostname === domain) return "";
  return hostname.endsWith(`.${domain}`) ? hostname.slice(0, -domain.length - 1) : null;
}
