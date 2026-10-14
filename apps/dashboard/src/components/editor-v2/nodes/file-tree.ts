import { Extension } from "@tiptap/core";
import type { Node as PmNode } from "@tiptap/pm/model";
import { Plugin, type Selection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { PHOSPHOR } from "../views/icon";

type Kind = "folder" | "file" | "placeholder";

/** How Nimbus's FileTree script reads an item: a nested list makes a folder, `...` a placeholder. */
export function itemKind(item: PmNode): Kind {
  const text = item.firstChild?.textContent.trim() ?? "";
  if (item.childCount === 1 && (text === "..." || text === "…")) return "placeholder";
  let nested = false;
  item.forEach((child) => {
    if (child.type.name === "bulletList") nested = true;
  });
  return nested ? "folder" : "file";
}

function icon(name: keyof typeof PHOSPHOR, className: string): string {
  return `<svg class="${className}" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="${PHOSPHOR[name]}"/></svg>`;
}

/** The icons the script puts before each label: a chevron and folder, or a spacer and file. */
const LEADS: Record<Kind, string> = {
  folder: icon("caretRight", "ft-chev") + icon("folder", "ft-icon"),
  file: `<span class="ft-sp"></span>${icon("file", "ft-icon")}`,
  placeholder: '<span class="ft-sp"></span><span class="ft-icon"></span>',
};

function lead(kind: Kind): HTMLElement {
  const span = document.createElement("span");
  span.className = "ft-lead";
  span.contentEditable = "false";
  span.innerHTML = LEADS[kind];
  return span;
}

/**
 * The script shows a folder without its trailing `/` and a placeholder as `⋯`. The row holding
 * the cursor shows its text as written instead, so nothing being edited is hidden.
 */
function decorate(doc: PmNode, selection: Selection): DecorationSet {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name !== "fileTree") return true;
    node.descendants((item, offset) => {
      if (item.type.name !== "listItem") return true;
      const at = pos + 1 + offset;
      const kind = itemKind(item);
      const row = item.firstChild!;
      const rowStart = at + 2;
      const rowEnd = rowStart + row.content.size;
      const editing = selection.from >= rowStart && selection.to <= rowEnd;
      decorations.push(
        Decoration.node(at, at + item.nodeSize, {
          class: `ft-${kind}${editing ? "" : " ft-shown"}`,
        }),
      );
      if (kind === "folder" && !editing && row.textContent.endsWith("/")) {
        decorations.push(Decoration.inline(rowEnd - 1, rowEnd, { class: "ft-slash" }));
      }
      // Inside the item's first paragraph, before its text.
      decorations.push(Decoration.widget(at + 2, () => lead(kind), { side: -1, key: kind }));
      return true;
    });
    return false;
  });
  return DecorationSet.create(doc, decorations);
}

/** Marks FileTree items the way Nimbus's script rebuilds them, so `editor.css` can draw the rows. */
export const fileTreeRows = Extension.create({
  name: "fileTreeRows",
  addProseMirrorPlugins: () => [
    new Plugin<DecorationSet>({
      state: {
        init: (_, state) => decorate(state.doc, state.selection),
        apply: (tr, rows) =>
          tr.docChanged || tr.selectionSet ? decorate(tr.doc, tr.selection) : rows,
      },
      props: {
        decorations(state) {
          return this.getState(state);
        },
      },
    }),
  ],
});
