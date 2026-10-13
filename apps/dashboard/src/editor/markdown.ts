import { getSchema, type AnyExtension, type JSONContent } from "@tiptap/core";
import { TaskList } from "@tiptap/extension-list";
import { TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import type { MarkdownManager } from "@tiptap/markdown";
import { Marked, type marked } from "marked";
import type { Schema } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";

import { admonition } from "./nodes/admonition";
import { Badge } from "./nodes/badge";
import {
  AttributedHeading,
  BackslashHardBreak,
  CodeBlockWithMeta,
  InlineImageParagraph,
  MarkdownBulletList,
  MarkdownLink,
  MarkdownListItem,
  MarkdownOrderedList,
  MarkdownTable,
  MarkdownTaskItem,
  NestableCode,
  markdownImage,
} from "./nodes/basics";
import { componentNodes, mdxFlow } from "./nodes/components";
import type { Syntax } from "./nodes/context";
import { document, type DocumentAttrs } from "./nodes/document";
import { fileTreeRows } from "./nodes/file-tree";
import { FootnoteDefinition, FootnoteReference } from "./nodes/footnote";
import { atomMarks } from "./nodes/marks";
import { rawBlock, rawInline } from "./nodes/raw";

export { COMPONENTS, type ComponentAttrs } from "./nodes/components";
export { getProp, getStringProp, setProp, type JsxProp, type JsxPropValue } from "./nodes/props";

/** `.mdx` pages get Nimbus components, admonitions and MDX escaping. `.md` pages are plain GFM. */
export type Flavor = "md" | "mdx";

/** The flavor of an editable page, or null when the path is not a page. */
export function flavorOf(path: string): Flavor | null {
  if (path.endsWith(".mdx")) return "mdx";
  if (path.endsWith(".md")) return "md";
  return null;
}

/**
 * The schema and Markdown rules for a page body, without the Markdown extension or any UI.
 *
 * The rules register tokenizers on the Markdown extension's `marked` instance, so give each editor
 * its own: `Markdown.configure({ marked: createMarked() })`. On the shared default instance, one
 * flavor's tokenizers would also run for the other.
 */
export function markdownExtensions(flavor: Flavor): AnyExtension[] {
  let schema: Schema | undefined;
  const syntax: Syntax = {
    flavor,
    rawBlock: flavor === "mdx" ? "mdxBlock" : "htmlBlock",
    rawInline: flavor === "mdx" ? "mdxInline" : "htmlInline",
    schema: () => (schema ??= getSchema(extensions)),
  };
  const extensions: AnyExtension[] = [
    StarterKit.configure({
      document: false,
      paragraph: false,
      heading: false,
      codeBlock: false,
      hardBreak: false,
      link: false,
      code: false,
      underline: false,
      orderedList: false,
      bulletList: false,
      listItem: false,
    }),
    document(syntax),
    InlineImageParagraph,
    AttributedHeading,
    CodeBlockWithMeta,
    NestableCode,
    BackslashHardBreak,
    MarkdownLink,
    MarkdownBulletList,
    MarkdownOrderedList,
    MarkdownListItem,
    markdownImage(syntax),
    MarkdownTable,
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    MarkdownTaskItem,
    FootnoteDefinition,
    FootnoteReference,
    rawBlock(syntax),
    rawInline(syntax),
    ...atomMarks,
    ...(flavor === "mdx"
      ? [mdxFlow(syntax), admonition(syntax), ...componentNodes(), Badge, fileTreeRows]
      : []),
  ];
  return extensions;
}

/** A marked instance of its own, for one editor's Markdown extension. */
export function createMarked(): typeof marked {
  // MarkdownManager only uses the instance API (use, Lexer, lexer, defaults), which Marked has.
  return new Marked() as unknown as typeof marked;
}

/**
 * Parses a page body, keeping the blank lines before the first block, the whitespace after the
 * last one and the line ending as document attributes, so `editor.getMarkdown()` reproduces the
 * body exactly.
 */
export function parseBody(markdown: MarkdownManager, body: string): JSONContent {
  const lineEnding = body.includes("\r\n") ? "\r\n" : "\n";
  const text = body.replace(/\r\n/g, "\n");
  // A blank body has no layout to keep, so the first edit gets the usual one: a blank line after
  // the frontmatter and a final newline.
  const blank = !text.trim();
  const leading = blank ? (text ? "\n" : "") : /^(?:[ \t]*\n)*/.exec(text)![0];
  const trailing = blank ? "\n" : /\s*$/.exec(text.slice(leading.length))![0];
  const doc = markdown.parse(
    blank ? "" : text.slice(leading.length, text.length - trailing.length),
  );
  const attrs: DocumentAttrs = { leading, trailing, lineEnding };
  const content = (doc.content ?? []).filter(
    (node) => node.type !== "paragraph" || node.content?.length,
  );
  return { type: "doc", attrs, content: content.length ? content : [{ type: "paragraph" }] };
}
