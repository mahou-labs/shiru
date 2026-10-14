import { Tooltip, TooltipPopup, TooltipTrigger } from "@shiru/ui/components/tooltip";
import { NodeSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import type { Editor } from "@tiptap/react";
import { IconGripDotsVerticalOutlineDuo18, IconPlusOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { useRef, useState, type DragEvent, type MouseEvent, type ReactNode } from "react";

import { openSlashMenu } from "./slash-menu";

type Hovered = { top: number; element: HTMLElement };

const BUTTON =
  "flex h-6 w-5 cursor-pointer items-center justify-center rounded-md text-muted-foreground/70 outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5";

/** The position of the top-level block an element of the editor belongs to. */
function blockAt(view: EditorView, element: Element): number | null {
  try {
    const inside = view.posAtDOM(element, 0);
    const $pos = view.state.doc.resolve(inside);
    return $pos.depth === 0 ? inside : $pos.before(1);
  } catch {
    return null;
  }
}

/**
 * A handle beside the top-level block under the pointer: `+` opens the slash menu below it, and
 * dragging the grip moves the block. Only top-level blocks get one, so a drag never tears a tab
 * out of its Tabs or an item out of its list.
 */
export function BlockHandle({ editor, children }: { editor: Editor; children: ReactNode }) {
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  function track(event: MouseEvent) {
    const view = editor.view;
    if (!frame.current || view.dragging) return;
    let closest: { element: HTMLElement; distance: number } | null = null;
    for (const element of Array.from(view.dom.children) as HTMLElement[]) {
      if (element.matches(".ProseMirror-widget, .ProseMirror-gapcursor")) continue;
      const rect = element.getBoundingClientRect();
      const distance =
        event.clientY < rect.top
          ? rect.top - event.clientY
          : Math.max(0, event.clientY - rect.bottom);
      if (!closest || distance < closest.distance) closest = { element, distance };
    }
    if (!closest || closest.distance > 24) return setHovered(null);
    if (closest.element === hovered?.element) return;
    const line = Number.parseFloat(getComputedStyle(closest.element).lineHeight) || 28;
    const rect = closest.element.getBoundingClientRect();
    const top =
      rect.top - frame.current.getBoundingClientRect().top + (Math.min(line, rect.height) - 24) / 2;
    setHovered({ top, element: closest.element });
  }

  // Read when used, since edits above the block move it after it was hovered.
  const hoveredPos = () => (hovered ? blockAt(editor.view, hovered.element) : null);

  function insertBelow() {
    const pos = hoveredPos();
    const node = pos === null ? null : editor.state.doc.nodeAt(pos);
    if (pos === null || !node) return;
    if (node.type.name === "paragraph" && node.content.size === 0) {
      return openSlashMenu(editor, pos + 1);
    }
    const after = pos + node.nodeSize;
    editor.chain().insertContentAt(after, { type: "paragraph" }).run();
    openSlashMenu(editor, after + 1);
  }

  function selectBlock() {
    const pos = hoveredPos();
    if (pos === null) return null;
    const selection = NodeSelection.create(editor.state.doc, pos);
    editor.view.dispatch(editor.state.tr.setSelection(selection));
    return selection;
  }

  function startDrag(event: DragEvent) {
    const view = editor.view;
    const selection = selectBlock();
    if (!hovered || !selection) return;
    const slice = selection.content();
    const { dom, text } = view.serializeForClipboard(slice);
    event.dataTransfer.clearData();
    event.dataTransfer.setData("text/html", dom.innerHTML);
    event.dataTransfer.setData("text/plain", text);
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setDragImage(hovered.element, 0, 0);
    view.dragging = { slice, move: true };
  }

  return (
    <div
      ref={frame}
      className="relative -ms-14 ps-14"
      onMouseMove={track}
      onMouseLeave={() => setHovered(null)}
    >
      {hovered && (
        <div
          className="absolute start-6 flex items-center max-sm:hidden"
          style={{ top: hovered.top }}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label="Insert a block below"
                  className={BUTTON}
                  onClick={insertBelow}
                />
              }
            >
              <IconPlusOutlineDuo18 />
            </TooltipTrigger>
            <TooltipPopup side="bottom">Insert below</TooltipPopup>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  draggable
                  aria-label="Drag to move"
                  className={`${BUTTON} cursor-grab active:cursor-grabbing`}
                  onDragStart={startDrag}
                  onDragEnd={() => setHovered(null)}
                  onClick={() => {
                    selectBlock();
                    editor.view.focus();
                  }}
                />
              }
            >
              <IconGripDotsVerticalOutlineDuo18 />
            </TooltipTrigger>
            <TooltipPopup side="bottom">Drag to move, click to select</TooltipPopup>
          </Tooltip>
        </div>
      )}
      {children}
    </div>
  );
}
