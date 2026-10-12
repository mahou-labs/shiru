import { Node, type JSONContent } from "@tiptap/core";

import type { Flavor } from "../markdown";
import { renderBlocks, type Syntax } from "./context";

/*
 * TipTap escapes text with fixed rules that over-escape (`6 \* 7`) and ignore MDX. Text is
 * therefore rewritten into placeholder characters before TipTap renders it, and the placeholders
 * are resolved once the whole body is rendered, when each one can see its final neighbors.
 */
const LITERAL = 0xe800;
const CONTEXTUAL = 0xe880;
const ESCAPE = String.fromCharCode(0xe900);
const ATOM_OPEN = String.fromCharCode(0xe901);
const ATOM_CLOSE = String.fromCharCode(0xe902);

const TIPTAP_ESCAPES = new Set("\\`*_[]~&<>");
const CODE_TYPES = new Set(["codeBlock", "code"]);

function literal(char: string): string {
  return TIPTAP_ESCAPES.has(char) ? String.fromCharCode(LITERAL + char.charCodeAt(0)) : char;
}

function escaped(char: string): string {
  return ESCAPE + literal(char);
}

type TextPlace = { flavor: Flavor; table?: boolean };

/** Rewrites text so it reads back as the same characters, escaping only what Markdown or MDX would parse. */
export function escapeText(text: string, place: TextPlace): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const rest = text.slice(i);
    switch (char) {
      case "\\":
      case "*":
      case "_":
      case "~":
        out += String.fromCharCode(CONTEXTUAL + char.charCodeAt(0));
        break;
      case "`":
      case "[":
      case "]":
        out += escaped(char);
        break;
      case "&":
        out += /^&(?:#\d+|#x[\da-f]+|\w+);/i.test(rest) ? escaped(char) : literal(char);
        break;
      case "<":
        // Sätteri reads `<` as JSX unless whitespace follows; Markdown only before a tag or autolink.
        out += (place.flavor === "mdx" ? /^<(?!\s)/ : /^<(?:[A-Za-z/!?]|$)/).test(rest)
          ? escaped(char)
          : literal(char);
        break;
      case "{":
      case "}":
        out += place.flavor === "mdx" ? escaped(char) : char;
        break;
      case "|":
        out += place.table ? escaped(char) : char;
        break;
      default:
        out += literal(char);
    }
  }
  return out;
}

/** Text that must stay byte for byte, such as a bare URL autolink. */
function literalText(text: string): string {
  return text.replace(/[\\`*_[\]~&<>]/g, literal);
}

/** Where a line of paragraph text needs a backslash so it does not open a block, or -1. */
function blockOpenerAt(line: string, first: boolean, flavor: Flavor): number {
  if (/^(?:#{1,6}(?:\s|$)|>|[-+*](?:\s|$))/.test(line)) return 0;
  if (/^(?:-[ \t]*){3,}$/.test(line) || (!first && /^=+[ \t]*$/.test(line))) return 0;
  if (flavor === "mdx" && line.startsWith(":::")) return 0;
  // Only a list starting at 1 can interrupt a paragraph.
  const ordered = /^(\d{1,9})[.)](?:\s|$)/.exec(line);
  if (ordered && (first || ordered[1] === "1")) return ordered[1].length;
  return -1;
}

function escapeLine(line: string, place: TextPlace, at: number): string {
  if (at < 0) return escapeText(line, place);
  return (
    escapeText(line.slice(0, at), place) + escaped(line[at]) + escapeText(line.slice(at + 1), place)
  );
}

type LinkAttrs = { href?: string; autolink?: string | null };

export function isAutolink(text: string, attrs: LinkAttrs): boolean {
  const href = attrs.href ?? "";
  return (
    !!attrs.autolink && (text === href || `mailto:${text}` === href || `http://${text}` === href)
  );
}

/**
 * Code spans keep their text, with three fixes TipTap lacks: a pipe in a table cell is escaped,
 * spaces at the edges stay inside the backticks, and neighboring spans under different marks stay
 * apart.
 */
function codeSpan(node: JSONContent, place: TextPlace): JSONContent {
  let text = node.text ?? "";
  if (place.table) text = text.replaceAll("|", `${ESCAPE}|`);
  text = text.replace(/^ +| +$/g, (spaces) =>
    String.fromCharCode(LITERAL + 32).repeat(spaces.length),
  );
  // TipTap continues a mark across nodes with equal attributes, so the code mark carries the others.
  const others = JSON.stringify((node.marks ?? []).filter((mark) => !CODE_TYPES.has(mark.type)));
  const marks = (node.marks ?? []).map((mark) =>
    CODE_TYPES.has(mark.type) ? { ...mark, attrs: { ...mark.attrs, around: others } } : mark,
  );
  return { ...node, text, marks };
}

type Pass = {
  flavor: Flavor;
  inlineTypes: Set<string>;
  atoms: string[];
  render: (node: JSONContent) => string;
};

function transformInline(nodes: JSONContent[], pass: Pass, parent: string, topLevel: boolean) {
  const { flavor } = pass;
  const place = { flavor, table: parent === "table" };
  return nodes.map((node, index) => {
    const previous = nodes[index - 1];
    const startsLine = parent === "paragraph" && (!previous || previous.type === "hardBreak");
    if (node.type !== "text" && node.type !== "hardBreak") {
      // TipTap closes every mark around an inline atom, so the atom joins its run as text instead.
      pass.atoms.push(pass.render({ ...node, marks: undefined }));
      return {
        type: "text",
        text: ATOM_OPEN + (pass.atoms.length - 1) + ATOM_CLOSE,
        marks: node.marks,
      };
    }
    if (node.type !== "text" || !node.text) return node;
    const marks = node.marks ?? [];
    if (marks.some((mark) => CODE_TYPES.has(mark.type))) return codeSpan(node, place);
    const link = marks.find((mark) => mark.type === "link");
    if (link && isAutolink(node.text, link.attrs ?? {})) {
      return { ...node, text: literalText(node.text) };
    }
    // A trailing `{#id}` in a Markdown heading is an attribute block, not text.
    const attributes = /[ \t]\{[^{}\n]*\}[ \t]*$/.exec(node.text);
    if (parent === "heading" && flavor === "md" && index === nodes.length - 1 && attributes) {
      return { ...node, text: escapeLine(node.text, place, attributes.index + 1) };
    }
    const text = node.text
      .split("\n")
      .map((line, i) => {
        const first = index === 0 && i === 0;
        // MDX reads a top-level paragraph starting with import/export as ESM.
        if (
          first &&
          topLevel &&
          flavor === "mdx" &&
          !marks.length &&
          /^(?:import|export)\b/.test(line)
        ) {
          return `${literal("&")}#${line.charCodeAt(0)};${escapeText(line.slice(1), place)}`;
        }
        if (i === 0 && (!startsLine || marks.length)) return escapeText(line, place);
        return escapeLine(line, place, blockOpenerAt(line, first, flavor));
      })
      .join("\n");
    return { ...node, text };
  });
}

function transform(nodes: JSONContent[], pass: Pass, parent: string, depth: number): JSONContent[] {
  if (CODE_TYPES.has(parent)) return nodes;
  const inline = nodes.some((node) => pass.inlineTypes.has(node.type ?? ""));
  const children = inline ? transformInline(nodes, pass, parent, depth === 1) : nodes;
  const cellParent = parent === "tableCell" || parent === "tableHeader";
  return children.map((node) =>
    node.content
      ? {
          ...node,
          content: transform(
            node.content,
            pass,
            cellParent && node.type === "paragraph" ? "table" : (node.type ?? ""),
            depth + 1,
          ),
        }
      : node,
  );
}

function isPunctuation(char: string | undefined): boolean {
  return !!char && /[!-/:-@[-`{-~]/.test(char);
}

function isSpace(char: string | undefined): boolean {
  return char === undefined || /\s/.test(char);
}

function isWordChar(char: string | undefined): boolean {
  return !!char && /[\p{L}\p{N}]/u.test(char);
}

/** Text with every placeholder turned back into the character it stands for. */
export function unescapeText(text: string): string {
  return text.replace(/[\ue800-\ue900]/g, (char) => plain(char)!);
}

function plain(char: string | undefined): string | undefined {
  if (char === undefined) return undefined;
  const code = char.charCodeAt(0);
  if (code === 0xe900) return "\\";
  if (code >= LITERAL && code < CONTEXTUAL + 0x80)
    return String.fromCharCode((code - LITERAL) % 0x80);
  return char;
}

/** Turns placeholders into characters, escaping the contextual ones only where their neighbors make them syntax. */
function resolve(rendered: string, atoms: string[]): string {
  const markdown = rendered.replace(
    new RegExp(`${ATOM_OPEN}(\\d+)${ATOM_CLOSE}`, "g"),
    (_, index: string) => atoms[Number(index)],
  );
  let out = "";
  for (let i = 0; i < markdown.length; i++) {
    const code = markdown.charCodeAt(i);
    if (code === 0xe900) out += "\\";
    else if (code >= LITERAL && code < CONTEXTUAL) out += String.fromCharCode(code - LITERAL);
    else if (code >= CONTEXTUAL && code < CONTEXTUAL + 0x80) {
      const char = String.fromCharCode(code - CONTEXTUAL);
      const before = plain(markdown[i - 1]);
      const after = plain(markdown[i + 1]);
      const keep =
        char === "\\"
          ? !isPunctuation(after) && after !== "\n" && after !== undefined
          : char === "_"
            ? (isWordChar(before) && isWordChar(after)) || (isSpace(before) && isSpace(after))
            : isSpace(before) && isSpace(after);
      out += keep ? char : `\\${char}`;
    } else out += markdown[i];
  }
  return out;
}

export type DocumentAttrs = { leading: string; trailing: string; lineEnding: "\n" | "\r\n" };

/**
 * The page body. `leading` and `trailing` keep the whitespace around the first and last blocks,
 * and `lineEnding` the file's newline, since the body is parsed with `\n` only.
 */
export function document(syntax: Syntax) {
  return Node.create({
    name: "doc",
    topNode: true,
    content: "block+",
    addAttributes: () => ({
      leading: { default: "", rendered: false },
      trailing: { default: "\n", rendered: false },
      lineEnding: { default: "\n", rendered: false },
    }),
    renderMarkdown(node, helpers) {
      const attrs = {
        leading: "",
        trailing: "\n",
        lineEnding: "\n",
        ...node.attrs,
      } as DocumentAttrs;
      const schema = syntax.schema();
      const pass: Pass = {
        flavor: syntax.flavor,
        inlineTypes: new Set(
          Object.values(schema.nodes)
            .filter((type) => type.isInline)
            .map((type) => type.name),
        ),
        atoms: [],
        render: (atom) => helpers.renderChildren([atom]),
      };
      const content = transform(node.content ?? [], pass, "doc", 0);
      const body = resolve(renderBlocks(helpers, content), pass.atoms);
      return body ? (attrs.leading + body + attrs.trailing).replace(/\n/g, attrs.lineEnding) : "";
    },
  });
}
