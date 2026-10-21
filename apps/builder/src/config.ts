import { z } from "zod";

const segment = "[A-Za-z0-9_~-][A-Za-z0-9._~-]*";
const sitePath = z
  .string({ error: "must be a string" })
  .regex(new RegExp(`^/(${segment}(/${segment})*/?)?$`), { error: "is not a valid path" })
  .meta({ description: "A page path on this site, such as `/guides/setup`." });

const label = z.string({ error: "must be a string" }).min(1, { error: "must not be empty" });

const navLink = z
  .strictObject({ label, href: sitePath }, { error: "must be an object" })
  .meta({ title: "Link", description: "A link to one page." });

type NavItemInput = z.input<typeof navLink> | { label: string; items: NavItemInput[] };

const navGroup: z.ZodType<{ label: string; items: NavItemInput[] }> = z
  .strictObject(
    {
      label,
      get items() {
        return z
          .array(navItem, { error: "must be an array" })
          .min(1, { error: "must not be empty" });
      },
    },
    { error: "must be an object" },
  )
  .meta({ id: "NavGroup", title: "Group", description: "A labelled group of links and groups." });

const navItem: z.ZodType<NavItemInput> = z.union([navLink, navGroup]).meta({ id: "NavItem" });

export const docsConfigSchema = z
  .strictObject(
    {
      $schema: z.string({ error: "must be a string" }).optional(),
      version: z.literal(1, { error: "must be 1" }),
      name: label.meta({ description: "Site name, shown in the header and page titles." }),
      description: z
        .string({ error: "must be a string" })
        .optional()
        .meta({ description: "One line about the docs, used for SEO and llms.txt." }),
      logo: z
        .string({ error: "must be a string" })
        .regex(/^public\/(?!.*\.\.)[^\\]+\.(svg|png|jpe?g|webp)$/, {
          error: "must be an .svg, .png, .jpg or .webp file under public/",
        })
        .optional()
        .meta({
          description:
            "Logo file shown in the header, such as `public/logo.svg`. public/ is served from the site root.",
        }),
      github: z
        .url({
          protocol: /^https$/,
          hostname: /^github\.com$/,
          error: "must be an https://github.com/ URL",
        })
        .optional()
        .meta({ description: "Repository URL linked from the header." }),
      navigation: z
        .array(navItem, { error: "must be an array" })
        .min(1, { error: "must not be empty" })
        .optional()
        .meta({
          description:
            "Sidebar order. Leave it out to build the sidebar from the src/content/docs/ folder tree.",
        }),
    },
    { error: "must be a JSON object" },
  )
  .meta({ title: "docs.config.json", description: "Configuration for a Shiru docs site." });

export type DocsConfig = z.output<typeof docsConfigSchema>;
export type NavItem = NavItemInput;

type Result = { ok: true; config: DocsConfig } | { ok: false; errors: string[] };

export function parseDocsConfig(text: string): Result {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      errors: [`docs.config.json: is not valid JSON (${(error as Error).message})`],
    };
  }
  const result = docsConfigSchema.safeParse(data, { reportInput: true });
  if (result.success) return { ok: true, config: result.data };
  // One field can fail several checks with the same message, such as a URL's protocol and host.
  const messages = new Set(describe(result.error.issues, []));
  return { ok: false, errors: [...messages].map((m) => `docs.config.json: ${m}`) };
}

function describe(issues: readonly z.core.$ZodIssue[], base: PropertyKey[]): string[] {
  return issues.flatMap((issue) => {
    const path = [...base, ...issue.path];
    switch (issue.code) {
      case "invalid_union": {
        // A union reports every branch's issues. The branch with the fewest is
        // the one the author meant: a link with a bad href, not a group missing items.
        const best = issue.errors.reduce((a, b) => (b.length < a.length ? b : a));
        return describe(best, path);
      }
      case "unrecognized_keys":
        return issue.keys.map((key) => `${formatPath([...path, key])} is not a known field`);
      case "invalid_type":
        if (issue.input === undefined) return [`${formatPath(path)} is required`];
    }
    return [`${formatPath(path)} ${issue.message}`];
  });
}

export function formatPath(path: readonly PropertyKey[]): string {
  if (path.length === 0) return "the file";
  return path
    .map((key, i) => (typeof key === "number" ? `[${key}]` : `${i === 0 ? "" : "."}${String(key)}`))
    .join("");
}
