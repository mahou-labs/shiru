import { Node, type MarkdownToken } from "@tiptap/core";

import { indexOfUnescaped } from "./scan";
import { parseBlocks, renderBlocks } from "./context";

const DEFINITION = /^\[\^([^\]\s]+)\]:[ \t]*/;
const REFERENCE = /^\[\^([^\]\s]+)\](?!:)/;

/** A GFM footnote body, `[^label]: text` with its following lines indented by four spaces. */
export const FootnoteDefinition = Node.create({
  name: "footnoteDefinition",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes: () => ({ label: { default: "", rendered: false } }),
  parseHTML: () => [{ tag: "div[data-footnote]" }],
  renderHTML: () => ["div", { "data-footnote": "" }, 0],
  markdownTokenizer: {
    name: "footnoteDefinition",
    level: "block",
    start: () => -1,
    tokenize(src, _tokens, lexer) {
      const open = DEFINITION.exec(src);
      if (!open) return undefined;
      const lines = src.slice(open[0].length).split("\n");
      const body = [lines[0]];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const indented = /^(?: {4}|\t)/.test(line);
        const lazy = line.trim() && body.at(-1)!.trim() && !/^\[\^?[^\]]*\]:/.test(line);
        const continues = !line.trim() && /^(?: {4}|\t)/.test(lines[i + 1] ?? "");
        if (!indented && !lazy && !continues) break;
        body.push(line.replace(/^(?: {1,4}|\t)/, ""));
      }
      const raw = open[0] + lines.slice(0, body.length).join("\n");
      const hasNewline = src.length > raw.length;
      return {
        type: "footnoteDefinition",
        raw: hasNewline ? `${raw}\n` : raw,
        label: open[1],
        tokens: lexer.blockTokens(`${body.join("\n")}\n`),
      };
    },
  },
  parseMarkdown: (token, helpers) => ({
    type: "footnoteDefinition",
    attrs: { label: (token as MarkdownToken & { label: string }).label },
    content: parseBlocks(helpers, token.tokens ?? []),
  }),
  renderMarkdown(node, helpers) {
    const body = renderBlocks(helpers, node.content)
      .split("\n")
      .map((line, i) => (i === 0 || !line ? line : `    ${line}`))
      .join("\n");
    return `[^${node.attrs?.label}]: ${body}`;
  },
});

/** A GFM footnote reference, `[^label]`. */
export const FootnoteReference = Node.create({
  name: "footnoteReference",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes: () => ({ label: { default: "", rendered: false } }),
  parseHTML: () => [{ tag: "sup[data-footnote]" }],
  renderHTML: ({ node }) => ["sup", { "data-footnote": "" }, node.attrs.label],
  markdownTokenizer: {
    name: "footnoteReference",
    level: "inline",
    start: (src) =>
      indexOfUnescaped(src, (text, i) => text.startsWith("[^", i) && REFERENCE.test(text.slice(i))),
    tokenize(src) {
      const match = REFERENCE.exec(src);
      return match ? { type: "footnoteReference", raw: match[0], label: match[1] } : undefined;
    },
  },
  parseMarkdown: (token) => ({
    type: "footnoteReference",
    attrs: { label: (token as MarkdownToken & { label: string }).label },
  }),
  renderMarkdown: (node) => `[^${node.attrs?.label}]`,
});
