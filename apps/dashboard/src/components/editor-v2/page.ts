import { isMap, isScalar, parseDocument } from "yaml";

/**
 * A page source cut in two. `frontmatter` is the whole fenced block exactly as written, fences and
 * line endings included, so `frontmatter + body` is always the original source.
 */
export type Page = { frontmatter: string | null; body: string };

/** The frontmatter keys the editor shows as fields. */
export type Fields = { title: string; description: string };

const FENCED = /(---|\+\+\+)[ \t]*\r?\n([\s\S]*?)^\1[ \t]*(?:\r?\n|$)/my;
const YAML_BLOCK = /^(---[ \t]*(\r?\n))([\s\S]*?)(^---[ \t]*(?:\r?\n|$))/m;

export function splitPage(source: string): Page {
  FENCED.lastIndex = 0;
  const match = FENCED.exec(source);
  if (!match) return { frontmatter: null, body: source };
  return { frontmatter: match[0], body: source.slice(match[0].length) };
}

export function joinPage(page: Page): string {
  return (page.frontmatter ?? "") + page.body;
}

type YamlBlock = { open: string; eol: string; yaml: string; close: string };

function yamlBlock(frontmatter: string): YamlBlock | null {
  const match = YAML_BLOCK.exec(frontmatter);
  if (!match || match.index !== 0 || match[0].length !== frontmatter.length) return null;
  const [, open, eol, yaml, close] = match;
  return { open, eol, yaml: yaml.replaceAll("\r\n", "\n"), close };
}

function parseYaml(yaml: string) {
  const doc = parseDocument(yaml);
  if (doc.errors.length > 0) return null;
  if (doc.contents !== null && !isMap(doc.contents)) return null;
  return doc;
}

function scalarText(value: unknown): string | null {
  if (value === undefined || value === null) return "";
  if (!isScalar(value)) return null;
  const scalar = value.value;
  if (scalar === null) return "";
  return typeof scalar === "string" || typeof scalar === "number" || typeof scalar === "boolean"
    ? String(scalar)
    : null;
}

/**
 * The title and description of a page, or null when its frontmatter is not a YAML mapping the
 * fields can edit safely (TOML, a syntax error, or a title that is not plain text).
 */
export function readFields(frontmatter: string | null): Fields | null {
  if (frontmatter === null) return { title: "", description: "" };
  const block = yamlBlock(frontmatter);
  const doc = block && parseYaml(block.yaml);
  if (!doc) return null;
  const title = scalarText(doc.get("title", true));
  const description = scalarText(doc.get("description", true));
  if (title === null || description === null) return null;
  return { title, description };
}

/**
 * Writes fields into the frontmatter through the YAML document, so comments, key order and every
 * other key stay as written. An empty description removes the key. Returns the frontmatter
 * unchanged when `readFields` would return null.
 */
export function writeFields(frontmatter: string | null, fields: Partial<Fields>): string | null {
  const block = yamlBlock(frontmatter ?? "---\n---\n");
  const doc = block && parseYaml(block.yaml);
  if (!block || !doc) return frontmatter;
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    const node = doc.get(key, true);
    if (key === "description" && value === "") {
      if (doc.contents) doc.delete(key);
    } else if (isScalar(node)) {
      node.value = value;
    } else {
      doc.set(key, value);
    }
  }
  const empty = doc.contents === null || (isMap(doc.contents) && doc.contents.items.length === 0);
  const yaml = empty && !doc.commentBefore && !doc.comment ? "" : doc.toString({ lineWidth: 0 });
  return block.open + yaml.replaceAll("\n", block.eol) + block.close;
}
