import GithubSlugger from "github-slugger";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Options as SanitizeSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { parse as yamlParse } from "yaml";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { z } from "zod";

import type { CompiledDocArtifact, DocHeading } from "./types";

const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  order: z.number().int().optional(),
});

const sanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
    h2: [...(defaultSchema.attributes?.h2 ?? []), ["id"]],
    h3: [...(defaultSchema.attributes?.h3 ?? []), ["id"]],
    a: [...(defaultSchema.attributes?.a ?? []), ["className"]],
  },
};

export async function hashMdx(mdx: string) {
  const data = new TextEncoder().encode(mdx);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function compileMdxDocument(args: {
  siteId: string;
  slug: string;
  mdx: string;
}): Promise<CompiledDocArtifact> {
  if (/^\s*(import|export)\s/m.test(args.mdx)) {
    throw new Error("MDX imports and exports are not supported");
  }

  const { frontmatter, content } = parseFrontmatter(args.mdx);
  const parsedFrontmatter = frontmatterSchema.parse(frontmatter);
  const headings = collectHeadings(content);
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkMdx)
    .use(rejectUnsafeMdxNodes)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(content);

  return {
    siteId: args.siteId,
    slug: args.slug,
    contentHash: await hashMdx(args.mdx),
    frontmatter: parsedFrontmatter,
    html: String(file),
    headings,
  };
}

function parseFrontmatter(mdx: string): { frontmatter: Record<string, unknown>; content: string } {
  const match = /^\uFEFF?---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(mdx);

  if (!match) {
    return { frontmatter: {}, content: mdx };
  }

  const parsed = yamlParse(match[1]);
  const frontmatter =
    parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};

  return {
    frontmatter,
    content: mdx.slice(match[0].length),
  };
}

function collectHeadings(markdown: string) {
  const slugger = new GithubSlugger();
  const headings: DocHeading[] = [];
  const tree = unified().use(remarkParse).parse(markdown);

  visit(tree, "heading", (node) => {
    if (node.depth !== 2 && node.depth !== 3) {
      return;
    }

    const text = node.children
      .map((child) => ("value" in child && typeof child.value === "string" ? child.value : ""))
      .join("")
      .trim();

    if (text) {
      headings.push({ id: slugger.slug(text), depth: node.depth, text });
    }
  });

  return headings;
}

function rejectUnsafeMdxNodes() {
  return (tree: unknown) => {
    visit(tree as Parameters<typeof visit>[0], (node) => {
      if (!node || typeof node !== "object" || !("type" in node)) {
        return;
      }

      if (
        node.type === "mdxjsEsm" ||
        node.type === "mdxFlowExpression" ||
        node.type === "mdxTextExpression"
      ) {
        throw new Error("MDX JavaScript expressions are not supported");
      }
    });
  };
}
