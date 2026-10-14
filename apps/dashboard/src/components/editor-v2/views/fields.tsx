import type { ReactNodeViewProps } from "@tiptap/react";
import type { ComponentProps } from "react";

import { getProp, setProp, type JsxProp, type JsxPropValue } from "../nodes/props";

/** A small square button in a block's chrome. */
export const ICON_BUTTON =
  "flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5";

export function isActive({ selected, selectionInside }: ReactNodeViewProps) {
  return selected || !!selectionInside;
}

/**
 * Chrome that stays out of the way until the block is hovered, holds the selection or has a
 * focused field. The block sets `data-active` from its node view's selection props.
 */
export const CHROME =
  "opacity-0 transition-opacity duration-150 group-hover/block:opacity-100 group-focus-within/block:opacity-100 group-data-[active=true]/block:opacity-100";

/** Like CHROME, for controls the published block has no room for: they take space only while editing. */
export const REVEAL = "hidden group-focus-within/block:block group-data-[active=true]/block:block";

/** A prop the field cannot edit as text. It is shown as written so it is never clobbered. */
export function FixedProp({ name, value }: { name: string; value: JsxPropValue }) {
  const text =
    value.kind === "expression" ? `{${value.source}}` : value.kind === "flag" ? name : "";
  return (
    <code
      title={`${name} is an expression. Edit it in the page source.`}
      className="inline-flex max-w-full items-center truncate rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xs"
    >
      {text}
    </code>
  );
}

type PropFieldProps = Omit<ComponentProps<"input">, "value" | "onChange"> & {
  props: JsxProp[];
  name: string;
  onChange: (props: JsxProp[]) => void;
  /** Keeps an empty string instead of removing the prop, for props the component requires. */
  required?: boolean;
};

/** A string prop edited as text. Expressions and flags stay read-only. */
export function PropField({ props, name, onChange, required, className, ...rest }: PropFieldProps) {
  const value = getProp(props, name);
  if (value && value.kind !== "string") return <FixedProp name={name} value={value} />;
  return (
    <input
      {...rest}
      value={value?.value ?? ""}
      spellCheck={false}
      className={`min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/60 ${className ?? ""}`}
      onChange={(event) => {
        const text = event.target.value;
        onChange(setProp(props, name, text || required ? { kind: "string", value: text } : null));
      }}
    />
  );
}

/** A small uppercase caption naming what a block is, such as "MDX" or "Tabs". */
export function BlockLabel({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={`select-none font-medium font-mono text-[0.6875rem] text-muted-foreground uppercase tracking-wider ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
