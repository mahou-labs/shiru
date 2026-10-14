import type { Node as PmNode } from "@tiptap/pm/model";
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { IconPlusOutlineDuo18, IconXmarkOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { useEffect, useId, useState } from "react";

import type { ComponentAttrs } from "../nodes/components";
import { getProp, setProp, type JsxProp } from "../nodes/props";
import { BlockLabel, CHROME, ICON_BUTTON, isActive } from "./fields";
import { Phosphor } from "./icon";

/** The `titles` array when it is a literal list of strings, the only form the editor rewrites. */
export function readTitles(props: JsxProp[]): string[] | null {
  const titles = getProp(props, "titles");
  if (!titles) return [];
  if (titles.kind !== "expression") return null;
  try {
    const value: unknown = JSON.parse(titles.source);
    return Array.isArray(value) && value.every((title) => typeof title === "string") ? value : null;
  } catch {
    return null;
  }
}

export function writeTitles(props: JsxProp[], titles: string[]): JsxProp[] {
  return setProp(
    props,
    "titles",
    titles.length ? { kind: "expression", source: JSON.stringify(titles) } : null,
  );
}

/**
 * `<CodeGroup titles>`: a tab per code block, labelled by `titles` or "Tab N" as Nimbus labels
 * them. The other blocks stay in the document and are only hidden.
 */
export function CodeGroupView(props: ReactNodeViewProps) {
  const { node, editor, getPos, deleteNode, updateAttributes } = props;
  const attrs = node.attrs as ComponentAttrs;
  const titles = readTitles(attrs.props);
  const [chosen, setChosen] = useState(0);
  const id = useId();
  const blocks: PmNode[] = [];
  node.forEach((child) => blocks.push(child));
  const active = Math.min(chosen, blocks.length - 1);

  useEffect(() => {
    const follow = () => {
      const pos = getPos();
      if (pos === undefined) return;
      const { from } = editor.state.selection;
      let start = pos + 1;
      blocks.forEach((block, index) => {
        if (from > start && from < start + block.nodeSize) setChosen(index);
        start += block.nodeSize;
      });
    };
    editor.on("selectionUpdate", follow);
    return () => void editor.off("selectionUpdate", follow);
  });

  function label(index: number): string {
    return titles?.[index] ?? `Tab ${index + 1}`;
  }

  function setLabel(index: number, value: string) {
    if (!titles) return;
    const next = blocks.map((_, i) => (i === index ? value : label(i)));
    updateAttributes({ props: writeTitles(attrs.props, next) });
  }

  function addBlock() {
    const pos = getPos();
    if (pos === undefined) return;
    const end = pos + node.nodeSize - 1;
    setChosen(blocks.length);
    const nextTitles = titles?.length
      ? [...blocks.map((_, i) => label(i)), `Tab ${blocks.length + 1}`]
      : titles;
    editor
      .chain()
      .insertContentAt(end, { type: "codeBlock" })
      .command(({ tr }) => {
        if (nextTitles) {
          tr.setNodeMarkup(pos, undefined, {
            ...attrs,
            props: writeTitles(attrs.props, nextTitles),
          });
        }
        return true;
      })
      .setTextSelection(end + 1)
      .focus()
      .run();
  }

  function removeBlock(index: number) {
    const pos = getPos();
    if (pos === undefined) return;
    if (blocks.length === 1) return deleteNode();
    let at = pos + 1;
    for (let i = 0; i < index; i++) at += blocks[i].nodeSize;
    const tr = editor.state.tr.delete(at, at + blocks[index].nodeSize);
    if (titles?.length) {
      tr.setNodeMarkup(pos, undefined, {
        ...attrs,
        props: writeTitles(
          attrs.props,
          titles.filter((_, i) => i !== index),
        ),
      });
    }
    editor.view.dispatch(tr);
    setChosen(Math.max(0, Math.min(active, blocks.length - 2)));
  }

  const code = blocks[active]?.textContent ?? "";
  return (
    <NodeViewWrapper data-cg={id} data-active={isActive(props)} className="group/block my-4 w-full">
      <style>{`[data-cg="${id}"] [data-cg-panels] > [data-node-view-content-react] > :not(:nth-child(${active + 1})) { display: none; }`}</style>
      <div className="flex w-full flex-col overflow-hidden rounded-lg bg-muted text-sm ring ring-border">
        <div
          contentEditable={false}
          role="tablist"
          aria-label="Code variants"
          className="flex items-center gap-2 bg-muted px-3 py-2 font-medium text-[0.8125rem] text-muted-foreground leading-5"
        >
          {blocks.map((_, index) => (
            <div
              // Blocks have no identity beyond their position, and labels change while typing.
              key={index}
              role="tab"
              aria-selected={index === active}
              onMouseDown={() => setChosen(index)}
              className="group/tab relative m-0 flex cursor-pointer items-center rounded-[0.375rem] px-2 py-0.5 font-medium text-muted-foreground text-xs leading-5 transition-colors hover:bg-accent hover:text-foreground aria-selected:bg-(--nb-selected) aria-selected:text-foreground"
            >
              {titles ? (
                <input
                  aria-label={`Tab ${index + 1} title`}
                  value={label(index)}
                  spellCheck={false}
                  className="field-sizing-content min-w-6 bg-transparent outline-none"
                  onFocus={() => setChosen(index)}
                  onChange={(event) => setLabel(index, event.target.value)}
                />
              ) : (
                label(index)
              )}
              <button
                type="button"
                aria-label={`Remove tab ${index + 1}`}
                onClick={() => removeBlock(index)}
                className="absolute -top-1.5 -right-1.5 hidden size-4 cursor-pointer items-center justify-center rounded-full bg-card text-muted-foreground shadow-(--nb-shadow-sm) ring ring-border hover:text-foreground group-hover/tab:flex [&_svg]:size-2.5"
              >
                <IconXmarkOutlineDuo18 />
              </button>
            </div>
          ))}
          <button
            type="button"
            aria-label="Add tab"
            onClick={addBlock}
            className={`${ICON_BUTTON} ${CHROME}`}
          >
            <IconPlusOutlineDuo18 />
          </button>
          <BlockLabel className={`ms-auto ${CHROME}`}>Code group</BlockLabel>
        </div>
        <div className="relative overflow-hidden rounded-lg bg-card ring ring-border">
          <div className="flex items-stretch">
            <NodeViewContent data-cg-panels="" className="min-w-0 flex-1" />
            <button
              type="button"
              contentEditable={false}
              aria-label="Copy to clipboard"
              onClick={() => void navigator.clipboard.writeText(code)}
              className="m-0 flex shrink-0 cursor-pointer items-center justify-center border-0 border-border border-l border-solid bg-transparent px-3 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Phosphor name="copy" className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
