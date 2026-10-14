import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { BadgeView } from "../views/badge";
import { renderProps } from "./components";
import type { JsxProp } from "./props";
import { scanOpenTag } from "./scan";

/**
 * Nimbus's `<Badge text variant size />` inside a line of text. Only the self-closing form with
 * plain props is a node; a badge with children stays raw inline MDX.
 */
export const Badge = Node.create({
  name: "badge",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes: () => ({ props: { default: [], rendered: false } }),
  parseHTML: () => [{ tag: "span[data-badge]" }],
  renderHTML: () => ["span", { "data-badge": "" }],
  addNodeView: () => ReactNodeViewRenderer(BadgeView, { as: "span" }),
  renderMarkdown: (node) => `<Badge${renderProps(node.attrs?.props ?? [])} />`,
});

/** The props of `source` when it is exactly a self-closing `<Badge />`, or null. */
export function badgeProps(source: string): JsxProp[] | null {
  const tag = scanOpenTag(source, 0, { expressions: true });
  if (!tag || tag.name !== "Badge" || !tag.selfClosing || tag.end !== source.length) return null;
  return tag.props;
}
