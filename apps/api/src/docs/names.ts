import { z } from "zod";

// Neither a slug nor a label can contain `--`, so `--` always separates a label from its doc.
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// `preview` is reserved too: a doc there could set cookies for every preview host under it.
const RESERVED_SLUGS: readonly string[] = ["app", "api", "docs", "preview", "t", "www"];

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

export function workerName(doc: DocSlug, target: TargetLabel) {
  return target === LIVE ? doc : `${doc}--${target}`;
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
