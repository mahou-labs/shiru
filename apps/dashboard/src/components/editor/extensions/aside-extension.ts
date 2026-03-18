import {
  Node,
  mergeAttributes,
  type JSONContent,
  type MarkdownToken,
  type MarkdownParseHelpers,
  type MarkdownParseResult,
  type MarkdownRendererHelpers,
  type MarkdownTokenizer,
  type MarkdownLexerConfiguration,
  type ReactNodeViewRendererOptions,
  type RenderContext,
} from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AsideView } from "./aside-view";

export type AsideVariant = "note" | "tip" | "caution" | "danger";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    aside: {
      setAside: (attrs?: { variant?: AsideVariant }) => ReturnType;
      toggleAside: (attrs?: { variant?: AsideVariant }) => ReturnType;
      unsetAside: () => ReturnType;
    };
  }
}

// ---------------------------------------------------------------------------
// Custom Markdown serialization for Starlight-compatible :::note syntax
// ---------------------------------------------------------------------------

/**
 * Serializes an aside node to Starlight's :::variant syntax.
 *
 * Output format:
 *   :::note
 *   Content here.
 *   :::
 *
 * Or with a custom title:
 *   :::note[Custom Title]
 *   Content here.
 *   :::
 */
function renderAsideMarkdown(
  node: JSONContent,
  helpers: MarkdownRendererHelpers,
  _ctx: RenderContext,
): string {
  const variant = String(node.attrs?.variant || "note");
  const title = node.attrs?.title ? `[${String(node.attrs.title)}]` : "";
  const content = helpers.renderChildren(node.content || [], "\n\n");
  return `:::${variant}${title}\n${content}\n:::`;
}

/**
 * Parses a Starlight aside token into a Tiptap aside node.
 */
function parseAsideMarkdown(
  token: MarkdownToken,
  helpers: MarkdownParseHelpers,
): MarkdownParseResult {
  const variant = token.variant || "note";
  const title = token.title || null;
  const children = helpers.parseChildren(token.tokens || []);

  return {
    type: "aside",
    attrs: { variant, title },
    content: children.length > 0 ? children : [{ type: "paragraph" }],
  };
}

/**
 * Custom MarkedJS tokenizer that recognizes :::note, :::tip, :::caution, :::danger.
 *
 * Handles:
 *   :::note
 *   :::note[Custom Title]
 *   :::tip[Title]
 *
 * Supports nested ::: blocks by tracking nesting depth.
 */
const asideTokenizer: MarkdownTokenizer = {
  name: "aside",
  level: "block",
  tokenize(
    src: string,
    _tokens: MarkdownToken[],
    lexer: MarkdownLexerConfiguration,
  ): MarkdownToken | undefined | void {
    // Match opening :::variant or :::variant[title]
    const openingMatch = /^:::(note|tip|caution|danger)(?:\[([^\]]*)\])?\s*\n/.exec(src);
    if (!openingMatch) return undefined;

    const variant = openingMatch[1];
    const title = openingMatch[2] || null;
    const rest = src.slice(openingMatch[0].length);

    // Find the matching closing ::: by tracking nesting
    let depth = 1;
    let contentEnd = 0;
    const lines = rest.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line !== undefined && /^:::(?:note|tip|caution|danger)/.test(line.trim())) {
        depth++;
      } else if (line !== undefined && line.trim() === ":::") {
        depth--;
        if (depth === 0) {
          contentEnd = lines.slice(0, i).join("\n").length;
          break;
        }
      }
    }

    if (depth !== 0) return undefined;

    const rawContent = rest.slice(0, contentEnd).trim();
    const fullLength = openingMatch[0].length + contentEnd + "\n:::".length;

    // Tokenize the inner content as block tokens
    const childTokens = lexer.blockTokens(rawContent);
    for (const t of childTokens) {
      if (t.tokens) {
        lexer.inlineTokens(t.raw || "");
      }
    }

    const token: MarkdownToken = {
      type: "aside",
      raw: src.slice(0, fullLength),
      variant,
      title,
      tokens: childTokens,
    } as MarkdownToken;

    return token;
  },
};

// ---------------------------------------------------------------------------
// Tiptap Node extension
// ---------------------------------------------------------------------------

export const Aside = Node.create({
  name: "aside",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "note" satisfies AsideVariant,
        parseHTML: (element) => element.getAttribute("data-aside-variant") || "note",
        renderHTML: (attributes) => ({
          "data-aside-variant": attributes.variant,
        }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-aside-title") || null,
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { "data-aside-title": attributes.title };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="aside"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "aside" }), 0];
  },

  addCommands() {
    return {
      setAside:
        (attrs) =>
        ({ commands }) =>
          commands.wrapIn(this.name, attrs),
      toggleAside:
        (attrs) =>
        ({ commands }) =>
          commands.toggleWrap(this.name, attrs),
      unsetAside:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { $anchor } = editor.state.selection;
        const isAtStart = $anchor.parentOffset === 0;

        if (!isAtStart || !editor.isActive(this.name)) {
          return false;
        }

        return editor.commands.unsetAside();
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AsideView, {
      contentDOMElementTag: "div",
    } as Partial<ReactNodeViewRendererOptions>);
  },

  // Starlight-compatible markdown serialization
  parseMarkdown: parseAsideMarkdown,
  renderMarkdown: renderAsideMarkdown,
  markdownTokenizer: asideTokenizer,
});
