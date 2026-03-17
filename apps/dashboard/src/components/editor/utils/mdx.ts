import { stringify as yamlStringify, parse as yamlParse } from "yaml";

// ---------------------------------------------------------------------------
// Starlight component detection
// ---------------------------------------------------------------------------

const STARLIGHT_COMPONENTS = [
  "Aside",
  "Badge",
  "Card",
  "CardGrid",
  "Code",
  "FileTree",
  "Icon",
  "LinkButton",
  "LinkCard",
  "Steps",
  "TabItem",
  "Tabs",
] as const;

function detectStarlightComponents(markdown: string): string[] {
  return STARLIGHT_COMPONENTS.filter((name) => {
    // Match JSX-style usage: <Component or <Component>
    const pattern = new RegExp(`<${name}[\\s/>]`);
    return pattern.test(markdown);
  });
}

// ---------------------------------------------------------------------------
// Export: editor content → Starlight .mdx file
// ---------------------------------------------------------------------------

/**
 * Converts editor markdown output + frontmatter into a complete Starlight .mdx file.
 *
 * The output is a valid .mdx file that can be placed directly into
 * Starlight's `src/content/docs/` directory.
 *
 * @param markdown - The markdown string from `editor.getMarkdown()`
 * @param frontmatter - The page frontmatter (title, description, etc.)
 * @returns A complete .mdx file string
 */
export function toStarlightMDX(markdown: string, frontmatter: Record<string, unknown>): string {
  const parts: string[] = [];

  // 1. Frontmatter
  const yamlContent = yamlStringify(frontmatter).trim();
  parts.push(`---\n${yamlContent}\n---`);

  // 2. Component imports (only if JSX components are used in the content)
  const usedComponents = detectStarlightComponents(markdown);
  if (usedComponents.length > 0) {
    const imports = usedComponents.join(", ");
    parts.push(`import { ${imports} } from '@astrojs/starlight/components';`);
  }

  // 3. Content
  parts.push(markdown.trim());

  return `${parts.join("\n\n")}\n`;
}

// ---------------------------------------------------------------------------
// Import: Starlight .mdx file → editor content + frontmatter
// ---------------------------------------------------------------------------

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n/;
const IMPORT_REGEX =
  /^import\s+\{[^}]*\}\s+from\s+['"]@astrojs\/starlight\/components['"];?\s*\n/gm;

/**
 * Parses a Starlight .mdx file into frontmatter and markdown content
 * suitable for loading into the Tiptap editor.
 *
 * @param mdx - The raw .mdx file contents
 * @returns An object with `frontmatter` and `markdown`
 */
export function fromStarlightMDX(mdx: string): {
  frontmatter: Record<string, unknown>;
  markdown: string;
} {
  let remaining = mdx;
  let frontmatter: Record<string, unknown> = {};

  // 1. Extract frontmatter
  const frontmatterMatch = FRONTMATTER_REGEX.exec(remaining);
  if (frontmatterMatch?.[1]) {
    const parsed: unknown = yamlParse(frontmatterMatch[1]);
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      const record: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(parsed)) {
        record[key] = value;
      }
      frontmatter = record;
    }
    remaining = remaining.slice(frontmatterMatch[0].length);
  }

  // 2. Strip Starlight component imports
  remaining = remaining.replace(IMPORT_REGEX, "");

  // 3. Trim leading/trailing whitespace
  const markdown = remaining.trim();

  return { frontmatter, markdown };
}
