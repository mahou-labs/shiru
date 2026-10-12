import {
  Extension,
  Node,
  type JSONContent,
  type MarkdownParseHelpers,
  type MarkdownToken,
} from "@tiptap/core";

import { ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import type { ComponentType } from "react";

import { AsideView } from "../views/callout";
import {
  CardGridView,
  CardView,
  PackageManagersView,
  StepView,
  StepsView,
  TabItemView,
  TabsView,
} from "../views/components";
import { parseBlocks, rawBlockNode, renderBlocks, validOr, type Syntax } from "./context";
import type { JsxProp, JsxPropValue } from "./props";
import { dedent, indent, scanElement, scanExpression } from "./scan";

/**
 * The global MDX components Nimbus provides. `content` is the ProseMirror content expression for
 * the children, or null when the component is self-closing. `within` names the only parent a
 * component may appear in. `view` draws the component in the editor.
 */
export const COMPONENTS = [
  { name: "Aside", content: "block+", view: AsideView },
  { name: "Card", content: "block+", view: CardView },
  { name: "CardGrid", content: "card+", view: CardGridView },
  { name: "PackageManagers", content: null, view: PackageManagersView },
  { name: "Steps", content: "orderedList | step+", view: StepsView },
  { name: "Step", content: "block+", within: "Steps", view: StepView },
  { name: "Tabs", content: "tabItem+", view: TabsView },
  { name: "TabItem", content: "block+", within: "Tabs", view: TabItemView },
] as const satisfies readonly {
  name: string;
  content: string | null;
  within?: string;
  view: ComponentType<ReactNodeViewProps>;
}[];

export type Component = (typeof COMPONENTS)[number];

/** Whether the author wrote the children on the tag's own line, as in `<Aside>Text</Aside>`. */
export type Layout = "block" | "inline";

export type ComponentAttrs = { props: JsxProp[]; layout: Layout };

export function nodeName(component: Component): string {
  return component.name[0].toLowerCase() + component.name.slice(1);
}

function renderProps(props: JsxProp[]): string {
  return props.map((prop) => ` ${prop.name}${renderValue(prop.value)}`).join("");
}

function renderValue(value: JsxPropValue): string {
  switch (value.kind) {
    case "flag":
      return "";
    case "expression":
      return `={${value.source}}`;
    case "string":
      if (!value.value.includes('"')) return `="${value.value}"`;
      if (!value.value.includes("'")) return `='${value.value}'`;
      return `={${JSON.stringify(value.value)}}`;
  }
}

type Children = { layout: Layout; tokens: MarkdownToken[] };

type FlowToken = MarkdownToken & {
  source: string;
  component?: { name: string; props: JsxProp[] | null; children: Children | null };
};

const MDX = { expressions: true };

/**
 * Where a block of JSX, an `{expression}` or ESM at the start of `src` ends, and how much of `src`
 * the block consumes with its line. Null when `src` does not start with one. A block interrupting a
 * paragraph cannot be ESM, and its opening tag must end its line, as in Sätteri.
 */
function flowLength(src: string, interrupting: boolean): { end: number; length: number } | null {
  const lead = /^[ \t]*/.exec(src)![0].length;
  let end = -1;
  if (src[lead] === "<" && !src.startsWith("<!--", lead)) {
    const element = scanElement(src, lead, MDX);
    const { open, closeStart } = element ?? {};
    const tagEndsLine =
      !open || open.selfClosing || closeStart === open.end || /^[ \t]*\n/.test(src.slice(open.end));
    end = element && (!interrupting || tagEndsLine) ? element.end : -1;
  } else if (src[lead] === "{") {
    end = scanExpression(src, lead);
  } else if (!interrupting && lead === 0 && /^(?:import|export)[\s{*]/.test(src)) {
    const blank = /\n[ \t]*(?:\n|$)/.exec(src);
    end = blank ? blank.index : src.length;
  }
  if (end < 0) return null;
  const lineEnd = src.indexOf("\n", end);
  const stop = lineEnd < 0 ? src.length : lineEnd;
  if (src.slice(end, stop).trim()) return null;
  return { end, length: lineEnd < 0 ? src.length : lineEnd + 1 };
}

function childrenOf(
  inner: string,
  lexer: { blockTokens: (src: string) => MarkdownToken[] },
): Children | null {
  const opensBlock = /^[ \t]*\n/.test(inner);
  const closesBlock = /\n[ \t]*$/.test(inner);
  if (opensBlock !== closesBlock || (!opensBlock && !inner.trim())) return null;
  if (!opensBlock) return { layout: "inline", tokens: lexer.blockTokens(inner) };
  const body = dedent(inner.replace(/^[ \t]*\n/, "").replace(/\n[ \t]*$/, ""));
  return { layout: "block", tokens: lexer.blockTokens(`${body}\n`) };
}

/**
 * Block-level MDX: JSX elements, `{expressions}` and import/export lines. Registry components
 * become their own nodes, everything else is kept verbatim in a raw block.
 */
export function mdxFlow(syntax: Syntax) {
  const byName = new Map<string, Component>(
    COMPONENTS.map((component) => [component.name, component]),
  );

  function parseFlow(
    token: FlowToken,
    helpers: MarkdownParseHelpers,
    parent: string | null,
  ): JSONContent {
    const raw = () => rawBlockNode(syntax, token.source);
    const found = token.component;
    const component = found && byName.get(found.name);
    if (!found || !component || !found.props) return raw();
    if ("within" in component && component.within !== parent) return raw();
    if ((component.content === null) !== (found.children === null)) return raw();
    const attrs: ComponentAttrs = { props: found.props, layout: found.children?.layout ?? "block" };
    if (!found.children) return validOr(syntax, { type: nodeName(component), attrs }, raw);
    const content = found.children.tokens.flatMap((child) =>
      child.type === "mdxFlow"
        ? [parseFlow(child as FlowToken, helpers, component.name)]
        : parseBlocks(helpers, [child]),
    );
    if (attrs.layout === "inline" && (content.length !== 1 || content[0].type !== "paragraph")) {
      return raw();
    }
    return validOr(syntax, { type: nodeName(component), attrs, content }, raw);
  }

  return Extension.create({
    name: "mdxFlow",
    markdownTokenName: "mdxFlow",
    markdownTokenizer: {
      name: "mdxFlow",
      level: "block",
      // JSX and expressions interrupt a paragraph in MDX, so a match on any later line ends it.
      start(src) {
        for (let i = src.indexOf("\n"); i >= 0; i = src.indexOf("\n", i + 1)) {
          const rest = src.slice(i + 1);
          if (/^[ \t]*(?:\n|$)/.test(rest)) return -1;
          if (flowLength(rest, true)) return i + 1;
        }
        return -1;
      },
      tokenize(src, _tokens, lexer) {
        const flow = flowLength(src, false);
        if (!flow) return undefined;
        const token: FlowToken = {
          type: "mdxFlow",
          raw: src.slice(0, flow.length),
          source: src.slice(0, flow.end),
        };
        const lead = /^[ \t]*/.exec(src)![0].length;
        const element = src[lead] === "<" ? scanElement(src, lead, MDX) : null;
        if (element && byName.has(element.open.name)) {
          const inner = src.slice(element.open.end, element.closeStart);
          token.component = {
            name: element.open.name,
            props: element.open.props,
            children: element.open.selfClosing ? null : childrenOf(inner, lexer),
          };
          if (!element.open.selfClosing && !token.component.children) token.component.props = null;
        }
        return token;
      },
    },
    parseMarkdown: (token, helpers) => parseFlow(token as FlowToken, helpers, null),
  });
}

/** One node per registry entry, so the schema itself enforces Tabs > TabItem and CardGrid > Card. */
export function componentNodes() {
  return COMPONENTS.map((component) => {
    const selfClosing = component.content === null;
    // Tabs, CardGrid and Steps list their items one per line rather than a blank line apart.
    const holdsItems = component.content !== null && component.content !== "block+";
    return Node.create({
      name: nodeName(component),
      group: "within" in component ? undefined : "block",
      content: component.content ?? undefined,
      atom: selfClosing,
      defining: true,
      addAttributes: () => ({
        props: { default: [], rendered: false },
        layout: { default: "block", rendered: false },
      }),
      parseHTML: () => [{ tag: `div[data-component="${component.name}"]` }],
      addNodeView: () => ReactNodeViewRenderer(component.view),
      renderHTML: () =>
        selfClosing
          ? ["div", { "data-component": component.name }]
          : ["div", { "data-component": component.name }, 0],
      renderMarkdown(node, helpers) {
        const attrs = node.attrs as ComponentAttrs;
        const open = `<${component.name}${renderProps(attrs.props)}`;
        if (selfClosing) return `${open} />`;
        const children = holdsItems
          ? helpers.renderChildren(node.content ?? [], "\n")
          : renderBlocks(helpers, node.content);
        const single = node.content?.length === 1 && node.content[0].type === "paragraph";
        if (attrs.layout === "inline" && single) return `${open}>${children}</${component.name}>`;
        return `${open}>\n${indent(children)}\n</${component.name}>`;
      },
    });
  });
}
