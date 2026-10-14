import { Extension, type JSONContent } from "@tiptap/core";

/*
 * TipTap applies a parsed mark only to text, so `**<Badge />**` or a linked image would lose the
 * mark. Marks are applied to every inline node here; the document renders the atoms in the run.
 */

export function applyMark(content: JSONContent[], mark: { type: string; attrs?: object }) {
  return content.map((node) => ({ ...node, marks: [...(node.marks ?? []), mark] }));
}

const TOKEN_MARKS = { strong: "bold", em: "italic", del: "strike" } as const;

/** Parses bold, italic and strikethrough ahead of the stock handlers, which skip atoms. */
export const atomMarks = Object.entries(TOKEN_MARKS).map(([token, mark]) =>
  Extension.create({
    name: `${mark}OnAtoms`,
    priority: 101,
    markdownTokenName: token,
    parseMarkdown: (parsed, helpers) =>
      applyMark(helpers.parseInline(parsed.tokens ?? []), { type: mark }),
  }),
);

export function destination(url: string): string {
  let depth = 0;
  for (const char of url) {
    depth += char === "(" ? 1 : char === ")" ? -1 : 0;
    if (depth < 0) break;
  }
  return depth !== 0 || /[\s<>]/.test(url) ? `<${url}>` : url;
}

export function linkTitle(text: string | null | undefined): string {
  return text ? ` "${text.replace(/["\\]/g, "\\$&")}"` : "";
}

export function inlineLink(
  text: string,
  attrs: { href?: string | null; title?: string | null },
): string {
  return `[${text}](${destination(attrs.href ?? "")}${linkTitle(attrs.title)})`;
}
