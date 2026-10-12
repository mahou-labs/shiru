import type { Node as PmNode } from "@tiptap/pm/model";
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { IconPlusOutlineDuo18, IconXmarkOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { useEffect, useId, useState } from "react";

import type { ComponentAttrs } from "../nodes/components";
import { getProp, setProp, type JsxProp, type JsxPropValue } from "../nodes/props";
import { BlockLabel, CHROME, FixedProp, PropField } from "./fields";

const ICON_BUTTON =
  "flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5";

function isActive({ selected, selectionInside }: ReactNodeViewProps) {
  return selected || !!selectionInside;
}

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
    <NodeViewWrapper data-tabs={id} data-active={isActive(props)} className="group/block my-6">
      <style>{`[data-tabs="${id}"] > [data-node-view-content] > [data-node-view-content-react] > :not(:nth-child(${active + 1})) { display: none; }`}</style>
      <div
        contentEditable={false}
        role="tablist"
        className="flex flex-wrap items-center gap-x-1 border-b"
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
              className={`group/tab -mb-px flex items-center gap-0.5 border-b-2 py-1.5 ps-2 pe-1 text-sm transition-colors ${selected ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
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
                className={`${ICON_BUTTON} size-5 opacity-0 group-hover/tab:opacity-100 focus-visible:opacity-100`}
              >
                <IconXmarkOutlineDuo18 />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          aria-label="Add tab"
          onClick={addTab}
          className={`${ICON_BUTTON} ${CHROME}`}
        >
          <IconPlusOutlineDuo18 />
        </button>
        <BlockLabel className={`ms-auto ${CHROME}`}>Tabs</BlockLabel>
      </div>
      <NodeViewContent className="pt-1" />
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

/** `<Steps>` around an ordered list or `<Step>` children, numbered by `editor.css`. */
export function StepsView(props: ReactNodeViewProps) {
  return (
    <NodeViewWrapper data-active={isActive(props)} className="group/block relative my-6">
      <BlockLabel className={`absolute -top-5 end-0 ${CHROME}`}>Steps</BlockLabel>
      <NodeViewContent className="editor-steps" />
    </NodeViewWrapper>
  );
}

export function StepView({ node, updateAttributes }: ReactNodeViewProps) {
  const { props } = node.attrs as ComponentAttrs;
  return (
    <NodeViewWrapper className="editor-step">
      <div contentEditable={false}>
        <PropField
          aria-label="Step title"
          props={props}
          name="title"
          placeholder="Step title"
          className="w-full font-semibold"
          onChange={(next) => updateAttributes({ props: next })}
        />
      </div>
      <NodeViewContent className="text-sm/6 [&_p]:my-1" />
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
    <NodeViewWrapper data-active={isActive(props)} className="group/block relative my-6">
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

/** `<Card title icon>`. The icon is an Iconify name, edited as text since it renders on the doc. */
export function CardView(props: ReactNodeViewProps) {
  const { node, updateAttributes } = props;
  const attrs = node.attrs as ComponentAttrs;
  const update = (next: JsxProp[]) => updateAttributes({ props: next });
  const hasIcon = getProp(attrs.props, "icon") !== undefined;
  return (
    <NodeViewWrapper
      data-active={isActive(props)}
      className="group/block my-4 rounded-lg border bg-card p-5 shadow-xs/5"
    >
      <div contentEditable={false} className="flex flex-col gap-1.5">
        <div className={hasIcon ? undefined : CHROME}>
          <PropField
            aria-label="Card icon"
            props={attrs.props}
            name="icon"
            placeholder="Icon, such as ph:lightning"
            className="w-full font-mono text-muted-foreground text-xs"
            onChange={update}
          />
        </div>
        <PropField
          aria-label="Card title"
          props={attrs.props}
          name="title"
          required
          placeholder="Title"
          className="w-full font-semibold"
          onChange={update}
        />
      </div>
      <NodeViewContent className="mt-1.5 text-muted-foreground text-sm/6 [&_p]:my-0 [&_p+p]:mt-2" />
    </NodeViewWrapper>
  );
}

/** Nimbus's command types, with the npm command each starts with. */
const NPM_COMMANDS = {
  add: "npm i",
  create: "npm create",
  dlx: "npx",
  exec: "npx",
  install: "npm install",
  remove: "npm uninstall",
  run: "npm run",
} as const;

type CommandType = keyof typeof NPM_COMMANDS;

function shown(value: JsxPropValue | undefined): string {
  if (!value || value.kind === "flag") return "";
  return value.kind === "string" ? value.value : `{${value.source}}`;
}

/** The npm tab of the rendered component, built the way Nimbus's `getCommand` builds it. */
export function npmCommand(props: JsxProp[]): string {
  const type = shown(getProp(props, "type")) || "add";
  const pkg = shown(getProp(props, "pkg"));
  const args = shown(getProp(props, "args"));
  let command: string = type in NPM_COMMANDS ? NPM_COMMANDS[type as CommandType] : `npm ${type}`;
  if (getProp(props, "dev") && type === "add") command += " -D";
  if (pkg) command += ` ${pkg}`;
  if (args) command += `${["dlx", "exec", "run"].includes(type) ? "" : " --"} ${args}`;
  return command;
}

const FIELD =
  "rounded-md border border-transparent px-1.5 py-0.5 hover:border-input focus:border-input";

export function PackageManagersView(props: ReactNodeViewProps) {
  const { node, updateAttributes } = props;
  const attrs = node.attrs as ComponentAttrs;
  const update = (next: JsxProp[]) => updateAttributes({ props: next });
  const type = getProp(attrs.props, "type");
  const dev = getProp(attrs.props, "dev");
  return (
    <NodeViewWrapper
      data-active={isActive(props)}
      className="group/block my-6 overflow-hidden rounded-lg border bg-card"
    >
      <div contentEditable={false}>
        <div className="flex items-center gap-1 border-b bg-muted/40 px-3 py-1.5">
          {["npm", "pnpm", "yarn", "bun"].map((manager, index) => (
            <span
              key={manager}
              className={`rounded-md px-2 py-0.5 font-medium text-xs ${index === 0 ? "bg-accent text-foreground" : "text-muted-foreground"}`}
            >
              {manager}
            </span>
          ))}
          <BlockLabel className={`ms-auto ${CHROME}`}>Package managers</BlockLabel>
        </div>
        <pre className="m-0! overflow-x-auto rounded-none! border-0! bg-transparent! px-4! py-3! font-mono text-sm">
          {npmCommand(attrs.props)}
        </pre>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2 text-muted-foreground text-xs">
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
                {Object.keys(NPM_COMMANDS).map((command) => (
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
