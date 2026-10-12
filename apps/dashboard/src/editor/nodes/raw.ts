import { Node } from "@tiptap/core";

import type { Syntax } from "./context";
import { indexOfUnescaped, scanElement, scanExpression, scanOpenTag, type ScanMode } from "./scan";

const sourceAttribute = {
  source: {
    default: "",
    parseHTML: (element: HTMLElement) => element.textContent ?? "",
    rendered: false,
  },
};

/** Verbatim MDX or HTML at block level. Its source is never escaped or reformatted. */
export function rawBlock(syntax: Syntax) {
  return Node.create({
    name: syntax.rawBlock,
    group: "block",
    atom: true,
    selectable: true,
    addAttributes: () => sourceAttribute,
    parseHTML() {
      return [{ tag: `pre[data-type="${this.name}"]`, preserveWhitespace: "full" }];
    },
    renderHTML({ node }) {
      return ["pre", { "data-type": this.name }, node.attrs.source];
    },
    markdownTokenName: "html",
    parseMarkdown: (token) => ({
      type: syntax.rawBlock,
      attrs: { source: (token.raw ?? "").replace(/\s+$/, "") },
    }),
    renderMarkdown: (node) => node.attrs?.source ?? "",
  });
}

/** Verbatim inline JSX, HTML or `{expression}`, kept whole from its opening to its closing tag. */
export function rawInline(syntax: Syntax) {
  const mode: ScanMode = { expressions: syntax.flavor === "mdx" };
  return Node.create({
    name: syntax.rawInline,
    group: "inline",
    inline: true,
    atom: true,
    selectable: true,
    addAttributes: () => sourceAttribute,
    parseHTML() {
      return [{ tag: `code[data-type="${this.name}"]` }];
    },
    renderHTML({ node }) {
      return ["code", { "data-type": this.name }, node.attrs.source];
    },
    markdownTokenizer: {
      name: syntax.rawInline,
      level: "inline",
      start: (src) =>
        indexOfUnescaped(
          src,
          (text, i) => "<{&".includes(text[i]) && inlineRawLength(text.slice(i), mode) > 0,
        ),
      tokenize(src) {
        const length = inlineRawLength(src, mode);
        if (!length) return undefined;
        return { type: syntax.rawInline, raw: src.slice(0, length) };
      },
    },
    parseMarkdown: (token) => ({ type: syntax.rawInline, attrs: { source: token.raw } }),
    renderMarkdown: (node) => node.attrs?.source ?? "",
  });
}

function inlineRawLength(src: string, mode: ScanMode): number {
  // TipTap decodes only &lt; &gt; &amp; &quot; and numeric references, so named ones stay raw.
  if (src[0] === "&") {
    const entity = /^&(?!(?:lt|gt|amp|quot);)[A-Za-z][A-Za-z\d]*;/.exec(src);
    return entity ? entity[0].length : 0;
  }
  if (src[0] === "{") return mode.expressions ? Math.max(scanExpression(src, 0), 0) : 0;
  if (src[0] !== "<") return 0;
  if (src.startsWith("<!--")) {
    const close = src.indexOf("-->", 4);
    return close < 0 ? 0 : close + 3;
  }
  const other = /^(?:<\/[A-Za-z][\w.:-]*\s*>|<\/>|<![A-Za-z][^>]*>|<\?[\s\S]*?\?>)/.exec(src);
  if (other) return other[0].length;
  return scanElement(src, 0, mode)?.end ?? scanOpenTag(src, 0, mode)?.end ?? 0;
}
