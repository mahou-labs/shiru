import { Node, type JSONContent } from "@tiptap/core";
import CodeBlock from "@tiptap/extension-code-block";
import { UndoRedo } from "@tiptap/extensions";

/**
 * The whole page source as one block of plain text, so saving writes back exactly what was
 * loaded plus the keystrokes: no Markdown parsing, no reformatting.
 */
export const sourceExtensions = [
  Node.create({ name: "doc", topNode: true, content: "codeBlock" }),
  Node.create({ name: "text", group: "inline" }),
  CodeBlock.configure({
    enableTabIndentation: true,
    exitOnTripleEnter: false,
    exitOnArrowDown: false,
    HTMLAttributes: { class: "whitespace-pre-wrap break-words font-mono text-sm leading-relaxed" },
  }),
  UndoRedo,
];

/** A code block cannot hold an empty text node, so an empty page is an empty block. */
export function sourceDoc(source: string): JSONContent {
  const content = source ? [{ type: "text", text: source }] : [];
  return { type: "doc", content: [{ type: "codeBlock", content }] };
}
