import { Node, wrappingInputRule, type MarkdownToken } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { AdmonitionView } from "../views/callout";

import { parseBlocks, rawBlockNode, renderBlocks, validOr, type Syntax } from "./context";

export const ADMONITION_KEYWORDS = [
  "note",
  "info",
  "tip",
  "caution",
  "warning",
  "important",
  "danger",
] as const;

export type AdmonitionAttrs = { keyword: string; title: string | null };

type AdmonitionToken = MarkdownToken & { attrs: AdmonitionAttrs | null; source: string };

const OPENING = /^(:{3,})([A-Za-z][\w-]*)(?:\[([^\]\n]*)\])?[ \t]*(\{[^\n]*\})?[ \t]*(?:\n|$)/;

/** The length of the `:::` container that opens `src`, through its closing fence and line. */
function containerLength(src: string): number {
  const open = OPENING.exec(src);
  if (!open) return 0;
  const depths: number[] = [];
  let fence: string | null = null;
  let offset = open[0].length;
  for (const line of src.slice(offset).split("\n")) {
    const lineEnd = offset + line.length + 1;
    const codeFence = /^[ \t]*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (codeFence?.[0] === fence[0] && codeFence.length >= fence.length) fence = null;
    } else if (codeFence) {
      fence = codeFence;
    } else if (/^:{3,}[A-Za-z]/.test(line)) {
      depths.push(/^:+/.exec(line)![0].length);
    } else if (/^:{3,}[ \t]*$/.test(line)) {
      if (!depths.length) return Math.min(lineEnd, src.length);
      depths.pop();
    }
    offset = lineEnd;
  }
  return src.length;
}

/** `:::note` ... `:::` and `:::tip[Title]`, the Nimbus admonitions. Other directives stay raw. */
export function admonition(syntax: Syntax) {
  return Node.create({
    name: "admonition",
    group: "block",
    content: "block+",
    defining: true,
    addAttributes: () => ({
      keyword: { default: "note", rendered: false },
      title: { default: null, rendered: false },
    }),
    parseHTML: () => [{ tag: "aside[data-admonition]" }],
    renderHTML: () => ["aside", { "data-admonition": "" }, 0],
    addNodeView: () => ReactNodeViewRenderer(AdmonitionView),
    addInputRules() {
      return [
        wrappingInputRule({
          find: new RegExp(`^:::(${ADMONITION_KEYWORDS.join("|")})\\s$`),
          type: this.type,
          getAttributes: (match) => ({ keyword: match[1], title: null }),
        }),
      ];
    },
    markdownTokenizer: {
      name: "admonition",
      level: "block",
      start(src) {
        const match = /\n:{3,}[A-Za-z]/.exec(src);
        return match ? match.index + 1 : -1;
      },
      tokenize(src, _tokens, lexer) {
        const length = containerLength(src);
        if (!length) return undefined;
        const raw = src.slice(0, length);
        const source = raw.replace(/\n$/, "");
        const [opening, , keyword, title, attributes] = OPENING.exec(raw)!;
        const known = (ADMONITION_KEYWORDS as readonly string[]).includes(keyword) && !attributes;
        const close = /\n?:{3,}[ \t]*\n?$/.exec(raw);
        const body = close ? raw.slice(opening.length, close.index) : raw.slice(opening.length);
        return {
          type: "admonition",
          raw,
          source,
          attrs: known && close ? { keyword, title: title ?? null } : null,
          tokens: known && close ? lexer.blockTokens(`${body}\n`) : [],
        };
      },
    },
    parseMarkdown(token, helpers) {
      const { attrs, source, tokens = [] } = token as AdmonitionToken;
      const raw = () => rawBlockNode(syntax, source);
      if (!attrs) return raw();
      return validOr(
        syntax,
        { type: "admonition", attrs, content: parseBlocks(helpers, tokens) },
        raw,
      );
    },
    renderMarkdown(node, helpers) {
      const { keyword, title } = node.attrs as AdmonitionAttrs;
      const children = renderBlocks(helpers, node.content);
      const nested = Math.max(0, ...(children.match(/^:{3,}/gm) ?? []).map((run) => run.length));
      const fence = ":".repeat(Math.max(3, nested + 1));
      return `${fence}${keyword}${title === null ? "" : `[${title}]`}\n${children}\n${fence}`;
    },
  });
}
