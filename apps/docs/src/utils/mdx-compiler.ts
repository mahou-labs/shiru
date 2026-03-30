import { compile } from "@mdx-js/mdx";

export interface CompiledMdx {
  code: string;
  frontmatter: Record<string, unknown>;
}

/** Parses YAML-style frontmatter from the top of an MDX source string, returning the key-value pairs and the remaining content. */
function extractFrontmatter(source: string): {
  frontmatter: Record<string, unknown>;
  content: string;
} {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: source };

  const fm: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      const val = kv[2].replace(/^["']|["']$/g, "").trim();
      fm[kv[1]] =
        val === "true" ? true : val === "false" ? false : isNaN(Number(val)) ? val : Number(val);
    }
  }

  return { frontmatter: fm, content: match[2] };
}

/** Compiles an MDX source string into executable JS code, extracting frontmatter separately. Output uses "function-body" format for runtime evaluation. */
export async function compileMdx(source: string): Promise<CompiledMdx> {
  const { frontmatter, content } = extractFrontmatter(source);

  const compiled = await compile(content, {
    outputFormat: "function-body",
    development: false,
  });

  return {
    code: String(compiled),
    frontmatter,
  };
}
