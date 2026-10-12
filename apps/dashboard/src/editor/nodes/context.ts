import type {
  JSONContent,
  MarkdownParseHelpers,
  MarkdownRendererHelpers,
  MarkdownToken,
} from "@tiptap/core";
import type { Schema } from "@tiptap/pm/model";

import type { Flavor } from "../markdown";

/** What every node needs to know about the page it parses and renders. */
export type Syntax = {
  flavor: Flavor;
  /** The node that holds raw MDX (mdx) or raw HTML (md) at block level. */
  rawBlock: "mdxBlock" | "htmlBlock";
  rawInline: "mdxInline" | "htmlInline";
  /** The schema built from this flavor's extensions, used to reject children a node cannot hold. */
  schema: () => Schema;
};

export function rawBlockNode(syntax: Syntax, source: string): JSONContent {
  return { type: syntax.rawBlock, attrs: { source } };
}

/** Accepts `node` only when the schema does, so unrepresentable markup falls back to raw source. */
export function validOr(
  syntax: Syntax,
  node: JSONContent,
  fallback: () => JSONContent,
): JSONContent {
  try {
    syntax.schema().nodeFromJSON(node).check();
    return node;
  } catch {
    return fallback();
  }
}

/** Block tokens to nodes. Marked emits `text` instead of `paragraph` tokens inside tight list items. */
export function parseBlocks(helpers: MarkdownParseHelpers, tokens: MarkdownToken[]): JSONContent[] {
  return tokens.flatMap((token) => {
    if (token.type === "space") return [];
    if (token.type === "text") {
      return [{ type: "paragraph", content: helpers.parseInline(token.tokens ?? []) }];
    }
    return helpers.parseChildren([token]);
  });
}

/** Renders block children one blank line apart. Empty paragraphs have no Markdown form, so they are dropped. */
export function renderBlocks(helpers: MarkdownRendererHelpers, nodes: JSONContent[] = []): string {
  const blocks = nodes.filter((node) => node.type !== "paragraph" || node.content?.length);
  return helpers.renderChildren(blocks, "\n\n");
}
