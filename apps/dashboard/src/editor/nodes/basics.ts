import type { JSONContent, MarkdownRendererHelpers, MarkdownToken } from "@tiptap/core";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { BulletList, ListItem, OrderedList, TaskItem } from "@tiptap/extension-list";
import Paragraph from "@tiptap/extension-paragraph";
import { Table } from "@tiptap/extension-table";

import type { Syntax } from "./context";
import { applyMark, destination, inlineLink, linkTitle } from "./marks";
import { indent } from "./scan";
import { escapeText, isAutolink, unescapeText } from "./document";

/** Images stay inline, so a standalone image is a paragraph holding one image. */
export const InlineImageParagraph = Paragraph.extend({
  parseMarkdown: (token, helpers) => ({
    type: "paragraph",
    content: helpers.parseInline(token.tokens ?? []),
  }),
});

const HEADING_ATTRIBUTES = /[ \t]+\{([^{}\n]*)\}[ \t]*$/;

/** Headings keep a trailing `{#id .class}` attribute block as written. */
export const AttributedHeading = Heading.extend({
  addAttributes() {
    return { ...this.parent?.(), attributes: { default: null, rendered: false } };
  },
  parseMarkdown(token, helpers) {
    const text = token.text ?? "";
    const match = HEADING_ATTRIBUTES.exec(text);
    const isAttributes = match && /^\s*(?:[#.]|[\w-]+=)/.test(match[1]);
    const tokens =
      isAttributes && helpers.tokenizeInline
        ? helpers.tokenizeInline(text.slice(0, match.index))
        : (token.tokens ?? []);
    return {
      type: "heading",
      attrs: { level: token.depth ?? 1, attributes: isAttributes ? match[1] : null },
      content: helpers.parseInline(tokens),
    };
  },
  renderMarkdown(node, helpers) {
    const attributes = node.attrs?.attributes;
    const text = helpers.renderChildren(node.content ?? []);
    const suffix = attributes === null || attributes === undefined ? "" : ` {${attributes}}`;
    return `${"#".repeat(node.attrs?.level ?? 1)} ${text}${suffix}`.trimEnd();
  },
});

/** Markdown nests code spans in bold, italic and links, as in **`--flag`**. */
export const NestableCode = Code.extend({ excludes: "" });

/** Code fences keep the info string after the language, such as `title="a.ts" {1,3-5}`. */
export const CodeBlockWithMeta = CodeBlock.extend({
  addAttributes() {
    return { ...this.parent?.(), meta: { default: null, rendered: false } };
  },
  parseMarkdown(token) {
    const [, language, meta] = /^(\S*)\s*([\s\S]*)$/.exec((token.lang ?? "").trim())!;
    return {
      type: "codeBlock",
      attrs: { language: language || null, meta: meta || null },
      content: token.text ? [{ type: "text", text: token.text }] : [],
    };
  },
  renderMarkdown(node) {
    const code = (node.content ?? []).map((child: JSONContent) => child.text ?? "").join("");
    const longest = Math.max(0, ...(code.match(/`{3,}/g) ?? []).map((run) => run.length));
    const fence = "`".repeat(Math.max(3, longest + 1));
    const info = [node.attrs?.language, node.attrs?.meta].filter(Boolean).join(" ");
    return code ? `${fence}${info}\n${code}\n${fence}` : `${fence}${info}\n${fence}`;
  },
});

/**
 * Lists keep their marker, since a different bullet or delimiter starts a new list, and whether
 * their items were a blank line apart. Marked's `loose` also counts blank lines inside an item,
 * which the item keeps as `spread` instead.
 */
function listAttributes(marker: string) {
  return {
    marker: { default: marker, rendered: false },
    loose: { default: false, rendered: false },
  };
}

function itemsApart(token: MarkdownToken): boolean {
  return (token.items ?? []).slice(0, -1).some((item) => /\n[ \t]*\n\s*$/.test(item.raw ?? ""));
}

function renderList(node: JSONContent, helpers: MarkdownRendererHelpers): string {
  return helpers.renderChildren(node.content ?? [], node.attrs?.loose ? "\n\n" : "\n");
}

export const MarkdownBulletList = BulletList.extend({
  addAttributes: () => listAttributes("-"),
  parseMarkdown: (token, helpers) =>
    token.ordered
      ? []
      : {
          type: "bulletList",
          attrs: {
            marker: /^\s*([-*+])/.exec(token.raw ?? "")?.[1] ?? "-",
            loose: itemsApart(token),
          },
          content: helpers.parseChildren(token.items ?? []),
        },
  renderMarkdown: renderList,
});

/** Uses marked's own list tokenizer, since TipTap's replacement shifts fenced code in loose items. */
export const MarkdownOrderedList = OrderedList.extend({
  markdownTokenizer: null as never,
  addAttributes() {
    return { ...this.parent?.(), ...listAttributes(".") };
  },
  parseMarkdown: (token, helpers) =>
    token.ordered
      ? {
          type: "orderedList",
          attrs: {
            start: token.start === "" ? 1 : Number(token.start ?? 1),
            marker: /^\s*\d+([.)])/.exec(token.raw ?? "")?.[1] ?? ".",
            loose: itemsApart(token),
          },
          content: helpers.parseChildren(token.items ?? []),
        }
      : [],
  renderMarkdown: renderList,
});

/** One list item: the marker, then every following line indented to the content column. */
function renderItem(
  node: JSONContent,
  helpers: MarkdownRendererHelpers,
  prefix: string,
  spread: boolean,
): string {
  const pad = " ".repeat(prefix.length);
  const [first, ...rest] = node.content ?? [];
  // A placeholder paragraph lets an item start with another block, such as `- ```js`.
  const children = !first?.content?.length && rest.length ? rest : (node.content ?? []);
  const blocks = children.map((child, index) => {
    const block = helpers.renderChild?.(child, index) ?? helpers.renderChildren([child]);
    const separator = index === 0 ? "" : spread || child.type === "paragraph" ? "\n\n" : "\n";
    return separator + indent(block, pad);
  });
  return prefix + blocks.join("").slice(pad.length);
}

/** `spread` records a blank line between the item's own blocks. */
export const MarkdownListItem = ListItem.extend({
  addAttributes: () => ({ spread: { default: false, rendered: false } }),
  parseMarkdown(token, helpers) {
    const item = this.parent?.(token, helpers) as JSONContent;
    const content = item.content ?? [];
    if (content[0]?.type !== "paragraph") content.unshift({ type: "paragraph" });
    // Blank lines inside a nested list belong to that list, not to this item.
    const raw = token.raw ?? "";
    const nested = /\n[ \t]*(?:[-*+]|\d+[.)])\s/.exec(raw);
    const own = nested ? raw.slice(0, nested.index + 1) : raw.replace(/\s+$/, "");
    return { ...item, content, attrs: { spread: /\n[ \t]*\n/.test(own) } };
  },
  renderMarkdown(node, helpers, context) {
    const list = context.meta?.parentAttrs ?? {};
    const marker =
      context.parentType === "orderedList"
        ? `${(list.start ?? 1) + context.index}${list.marker ?? "."} `
        : `${list.marker ?? "-"} `;
    return renderItem(node, helpers, marker, !!node.attrs?.spread);
  },
});

export const MarkdownTaskItem = TaskItem.configure({ nested: true }).extend({
  renderMarkdown: (node, helpers) =>
    renderItem(node, helpers, "- ", false).replace(
      /^- /,
      `- [${node.attrs?.checked ? "x" : " "}] `,
    ),
});

/** A backslash survives editors that strip trailing whitespace, unlike two spaces. */
export const BackslashHardBreak = HardBreak.extend({
  renderMarkdown: () => "\\\n",
});

export function markdownImage(syntax: Syntax) {
  return Image.configure({ inline: true }).extend({
    renderMarkdown(node) {
      const alt = escapeText(node.attrs?.alt ?? "", { flavor: syntax.flavor });
      return `![${alt}](${destination(node.attrs?.src ?? "")}${linkTitle(node.attrs?.title)})`;
    },
  });
}

/** Links remember whether they were written as an autolink, `<https://…>` or a bare URL. */
export const MarkdownLink = Link.configure({ openOnClick: false }).extend({
  addAttributes() {
    return { ...this.parent?.(), autolink: { default: null, rendered: false } };
  },
  parseMarkdown(token, helpers) {
    const raw = token.raw ?? "";
    const autolink = raw.startsWith("<") ? "angle" : raw.startsWith("[") ? null : "bare";
    const attrs = { href: token.href, title: token.title || null, autolink };
    return applyMark(helpers.parseInline(token.tokens ?? []), { type: "link", attrs });
  },
  renderMarkdown(node, helpers, context) {
    const attrs = node.attrs ?? {};
    const text = helpers.renderChildren(node);
    const markText = context.meta?.markText;
    if (typeof markText === "string" && isAutolink(unescapeText(markText), attrs)) {
      return attrs.autolink === "angle" ? `<${text}>` : text;
    }
    return inlineLink(text, attrs);
  },
});

const DELIMITERS: Record<string, string> = { left: ":---", center: ":---:", right: "---:" };

/** GFM tables in one canonical shape, `| a | b |` with no padding. */
export const MarkdownTable = Table.extend({
  renderMarkdown(node, helpers) {
    const rows = (node.content ?? []).map((row: JSONContent) =>
      (row.content ?? []).map((cell) =>
        (cell.content ?? []).map((block) => helpers.renderChildren(block.content ?? [])).join(" "),
      ),
    );
    const header = node.content?.[0]?.content ?? [];
    const delimiter = header.map((cell) => DELIMITERS[cell.attrs?.align] ?? "---");
    const line = (cells: string[]) => `| ${cells.join(" | ")} |`;
    return [line(rows[0] ?? []), line(delimiter), ...rows.slice(1).map(line)].join("\n");
  },
});
