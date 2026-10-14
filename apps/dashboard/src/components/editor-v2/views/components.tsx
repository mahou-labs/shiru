import type { Node as PmNode } from "@tiptap/pm/model";
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { IconPlusOutlineDuo18, IconXmarkOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { useEffect, useId, useState } from "react";

import type { ComponentAttrs } from "../nodes/components";
import { getProp, setProp, type JsxProp } from "../nodes/props";
import { COMMAND_TYPES, packageManagerTabs } from "../package-managers";
import { BlockLabel, CHROME, FixedProp, ICON_BUTTON, isActive, PropField, REVEAL } from "./fields";
import { Icon, Phosphor } from "./icon";

/** Positions of a node's children, for edits made from the parent's view. */
function childPositions(node: PmNode, pos: number): number[] {
  const positions: number[] = [];
  node.forEach((_, offset) => positions.push(pos + 1 + offset));
  return positions;
}

function labelled(name: string, value: string): JsxProp[] {
  return [{ name, value: { kind: "string", value } }];
}

/**
 * `<Tabs>`: a strip of editable labels over the active tab. The other tabs stay in the document
 * and are only hidden, so they keep their content and still serialize.
 */
export function TabsView(props: ReactNodeViewProps) {
  const { node, editor, getPos, deleteNode } = props;
  const [chosen, setChosen] = useState(0);
  const id = useId();
  const items: PmNode[] = [];
  node.forEach((child) => items.push(child));
  const active = Math.min(chosen, items.length - 1);

  // Undo, search or the arrow keys can move the cursor into a hidden tab, which then shows.
  useEffect(() => {
    const follow = () => {
      const pos = getPos();
      if (pos === undefined) return;
      const { from } = editor.state.selection;
      const index = childPositions(node, pos).findIndex(
        (start, i) => from > start && from < start + items[i].nodeSize,
      );
      if (index >= 0) setChosen(index);
    };
    editor.on("selectionUpdate", follow);
    return () => void editor.off("selectionUpdate", follow);
  });

  function setLabel(index: number, next: JsxProp[]) {
    const pos = getPos();
    if (pos === undefined) return;
    const at = childPositions(node, pos)[index];
    editor.view.dispatch(
      editor.state.tr.setNodeMarkup(at, undefined, { ...items[index].attrs, props: next }),
    );
  }

  function addTab() {
    const pos = getPos();
    if (pos === undefined) return;
    const end = pos + node.nodeSize - 1;
    setChosen(items.length);
    editor
      .chain()
      .insertContentAt(end, {
        type: "tabItem",
        attrs: { props: labelled("label", `Tab ${items.length + 1}`), layout: "block" },
        content: [{ type: "paragraph" }],
      })
      .setTextSelection(end + 2)
      .focus()
      .run();
  }

  function removeTab(index: number) {
    const pos = getPos();
    if (pos === undefined) return;
    if (items.length === 1) return deleteNode();
    const at = childPositions(node, pos)[index];
    editor.view.dispatch(editor.state.tr.delete(at, at + items[index].nodeSize));
    setChosen(Math.max(0, Math.min(active, items.length - 2)));
  }

  return (
    <NodeViewWrapper data-tabs={id} data-active={isActive(props)} className="group/block">
      <style>{`[data-tabs="${id}"] > [data-node-view-content] > [data-node-view-content-react] > :not(:nth-child(${active + 1})) { display: none; }`}</style>
      <div
        contentEditable={false}
        role="tablist"
        className="relative flex items-center overflow-x-auto overscroll-x-contain border-border border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => {
          const itemProps = (item.attrs as ComponentAttrs).props;
          const selected = index === active;
          return (
            <div
              // Tabs have no identity beyond their position, and labels change while typing.
              key={index}
              role="tab"
              aria-selected={selected}
              onMouseDown={() => setChosen(index)}
              className="group/tab relative shrink-0 whitespace-nowrap px-4 py-2 font-medium text-muted-foreground text-sm leading-6 transition-colors hover:text-foreground aria-selected:text-primary"
            >
              <PropField
                aria-label={`Tab ${index + 1} label`}
                props={itemProps}
                name="label"
                required
                placeholder="Label"
                className="field-sizing-content min-w-8"
                onFocus={() => setChosen(index)}
                onChange={(next) => setLabel(index, next)}
              />
              <button
                type="button"
                aria-label={`Remove tab ${index + 1}`}
                onClick={() => removeTab(index)}
                className="absolute top-1/2 right-0 flex size-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-muted-foreground opacity-0 outline-none transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover/tab:opacity-100 [&_svg]:size-3"
              >
                <IconXmarkOutlineDuo18 />
              </button>
              {selected && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 rounded-t-[0.25rem] bg-primary" />
              )}
            </div>
          );
        })}
        <button
          type="button"
          aria-label="Add tab"
          onClick={addTab}
          className={`${ICON_BUTTON} ms-1 ${CHROME}`}
        >
          <IconPlusOutlineDuo18 />
        </button>
        <BlockLabel className={`ms-auto ${CHROME}`}>Tabs</BlockLabel>
      </div>
      <NodeViewContent className="mt-3" />
    </NodeViewWrapper>
  );
}

export function TabItemView() {
  return (
    <NodeViewWrapper>
      <NodeViewContent />
    </NodeViewWrapper>
  );
}

/** `<Steps>` around an ordered list or `<Step>` children, numbered by `editor.css` as Nimbus numbers them. */
export function StepsView(props: ReactNodeViewProps) {
  return (
    <NodeViewWrapper data-active={isActive(props)} className="group/block steps relative">
      <BlockLabel className={`absolute -top-5 end-0 ${CHROME}`}>Steps</BlockLabel>
      <NodeViewContent />
    </NodeViewWrapper>
  );
}

/** The title is optional, so its field shows only once the step has one or is being edited. */
export function StepView(props: ReactNodeViewProps) {
  const { node, updateAttributes } = props;
  const { props: stepProps } = node.attrs as ComponentAttrs;
  const titled = getProp(stepProps, "title") !== undefined;
  return (
    <NodeViewWrapper data-step="" data-active={isActive(props)} className="group/block">
      <div contentEditable={false} className={titled ? undefined : REVEAL}>
        <PropField
          aria-label="Step title"
          props={stepProps}
          name="title"
          placeholder="Step title"
          className="m-0 block w-full font-semibold text-foreground"
          onChange={(next) => updateAttributes({ props: next })}
        />
      </div>
      <NodeViewContent className="mt-1 text-foreground text-sm leading-snug [&_p:first-child]:mt-0 [&_p:last-child]:mb-0" />
    </NodeViewWrapper>
  );
}

export function CardGridView(props: ReactNodeViewProps) {
  const { node, editor, getPos } = props;

  function addCard() {
    const pos = getPos();
    if (pos === undefined) return;
    const end = pos + node.nodeSize - 1;
    editor
      .chain()
      .insertContentAt(end, {
        type: "card",
        attrs: { props: labelled("title", "Title"), layout: "block" },
        content: [{ type: "paragraph" }],
      })
      .setTextSelection(end + 2)
      .focus()
      .run();
  }

  return (
    <NodeViewWrapper data-active={isActive(props)} className="group/block relative my-4">
      <div
        contentEditable={false}
        className={`absolute -top-6 end-0 flex items-center gap-1 ${CHROME}`}
      >
        <button type="button" aria-label="Add card" onClick={addCard} className={ICON_BUTTON}>
          <IconPlusOutlineDuo18 />
        </button>
        <BlockLabel>Card grid</BlockLabel>
      </div>
      <NodeViewContent className="[&>div]:grid [&>div]:grid-cols-1 [&>div]:gap-4 sm:[&>div]:grid-cols-2 [&>div>*>*]:my-0" />
    </NodeViewWrapper>
  );
}

/** `<Card title icon>`. The icon draws as on the site; its name is edited while the card is. */
export function CardView(props: ReactNodeViewProps) {
  const { node, updateAttributes } = props;
  const attrs = node.attrs as ComponentAttrs;
  const update = (next: JsxProp[]) => updateAttributes({ props: next });
  const icon = getProp(attrs.props, "icon");
  return (
    <NodeViewWrapper
      as="article"
      data-active={isActive(props)}
      className="group/block relative my-4 rounded-lg bg-card p-5 shadow-(--nb-shadow-sm) ring ring-border"
    >
      <div contentEditable={false}>
        {icon?.kind === "string" && (
          <Icon name={icon.value} className="mb-2.5 block h-6 w-6 text-foreground" />
        )}
        <div className={`absolute top-2 end-3 ${CHROME}`}>
          <PropField
            aria-label="Card icon"
            props={attrs.props}
            name="icon"
            placeholder="Icon, such as ph:lightning"
            className="field-sizing-content min-w-12 text-end font-mono text-muted-foreground text-xs"
            onChange={update}
          />
        </div>
        <PropField
          aria-label="Card title"
          props={attrs.props}
          name="title"
          required
          placeholder="Title"
          className="m-0 block w-full font-semibold text-foreground leading-snug"
          onChange={update}
        />
      </div>
      <NodeViewContent className="mt-1.5 text-muted-foreground text-sm leading-normal" />
    </NodeViewWrapper>
  );
}

const FIELD =
  "rounded-md border border-transparent px-1.5 py-0.5 hover:border-input focus:border-input";

/** Nimbus's PackageManagers: a LayerCard with a tab per manager over the command. */
export function PackageManagersView(props: ReactNodeViewProps) {
  const { node, updateAttributes } = props;
  const attrs = node.attrs as ComponentAttrs;
  const update = (next: JsxProp[]) => updateAttributes({ props: next });
  const type = getProp(attrs.props, "type");
  const dev = getProp(attrs.props, "dev");
  const tabs = packageManagerTabs(attrs.props);
  const [chosen, setChosen] = useState(0);
  const tab = tabs[Math.min(chosen, tabs.length - 1)];
  const lines = tab?.command.split("\n") ?? [];
  const code = lines.at(-1) ?? "";
  const space = code.indexOf(" ");
  return (
    <NodeViewWrapper data-active={isActive(props)} className="group/block w-full">
      <div contentEditable={false}>
        <div className="flex w-full flex-col overflow-hidden rounded-lg bg-muted text-sm ring ring-border">
          <div
            role="tablist"
            aria-label="Package manager"
            className="flex items-center gap-2 bg-muted px-3 py-2 font-medium text-[0.8125rem] text-muted-foreground leading-5"
          >
            {tabs.map(({ manager }, index) => (
              <button
                key={manager}
                type="button"
                role="tab"
                aria-selected={tab?.manager === manager}
                onClick={() => setChosen(index)}
                className="m-0 cursor-pointer rounded-[0.375rem] border-0 bg-transparent px-2 py-0.5 font-medium text-muted-foreground text-xs leading-5 transition-colors hover:bg-accent hover:text-foreground aria-selected:bg-(--nb-selected) aria-selected:text-foreground"
              >
                {manager}
              </button>
            ))}
            <BlockLabel className={`ms-auto ${CHROME}`}>Package managers</BlockLabel>
          </div>
          {tab && (
            <div className="relative overflow-hidden rounded-lg bg-card ring ring-border">
              <div className="flex items-stretch">
                <pre className="my-0 min-w-0 grow overflow-x-auto whitespace-pre border-0 bg-transparent px-4 py-3 font-mono text-foreground text-sm leading-relaxed">
                  <code>
                    {lines.length > 1 && (
                      <span className="text-muted-foreground">{`${lines.slice(0, -1).join("\n")}\n`}</span>
                    )}
                    <span className="text-success">{space < 0 ? code : code.slice(0, space)}</span>
                    <span className="text-warning">{space < 0 ? "" : code.slice(space)}</span>
                  </code>
                </pre>
                <button
                  type="button"
                  aria-label="Copy to clipboard"
                  onClick={() => void navigator.clipboard.writeText(tab.command)}
                  className="m-0 flex shrink-0 cursor-pointer items-center justify-center border-0 border-border border-l border-solid bg-transparent px-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phosphor name="copy" className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 hidden flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs group-focus-within/block:flex group-data-[active=true]/block:flex">
          <label className="flex items-center gap-1">
            Package
            <PropField
              props={attrs.props}
              name="pkg"
              placeholder="name"
              className={`field-sizing-content min-w-16 font-mono text-foreground ${FIELD}`}
              onChange={update}
            />
          </label>
          <label className="flex items-center gap-1">
            Command
            {type && type.kind !== "string" ? (
              <FixedProp name="type" value={type} />
            ) : (
              <select
                value={type?.value ?? "add"}
                className={`bg-transparent font-mono text-foreground outline-none ${FIELD}`}
                onChange={(event) =>
                  update(
                    setProp(attrs.props, "type", { kind: "string", value: event.target.value }),
                  )
                }
              >
                {COMMAND_TYPES.map((command) => (
                  <option key={command} value={command}>
                    {command}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="flex items-center gap-1">
            Arguments
            <PropField
              props={attrs.props}
              name="args"
              placeholder="none"
              className={`field-sizing-content min-w-12 font-mono text-foreground ${FIELD}`}
              onChange={update}
            />
          </label>
          <label className="flex items-center gap-1.5">
            {dev?.kind === "expression" ? (
              <FixedProp name="dev" value={dev} />
            ) : (
              <input
                type="checkbox"
                checked={dev !== undefined}
                className="accent-foreground"
                onChange={(event) =>
                  update(
                    setProp(attrs.props, "dev", event.target.checked ? { kind: "flag" } : null),
                  )
                }
              />
            )}
            Dev dependency
          </label>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
