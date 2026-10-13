import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";

import { getProp, getStringProp, setProp, type JsxProp } from "../nodes/props";
import { FixedProp } from "./fields";

/** Nimbus's `badge/Badge.astro` variants, with its aliases. */
const VARIANTS: Record<string, string> = {
  default: "bg-accent text-muted-foreground",
  info: "bg-(--nb-info-muted) text-(--nb-info)",
  note: "bg-(--nb-info-muted) text-(--nb-info)",
  success: "bg-(--nb-success-muted) text-(--nb-success)",
  tip: "bg-(--nb-success-muted) text-(--nb-success)",
  warning: "bg-(--nb-warning-muted) text-(--nb-warning)",
  caution: "bg-(--nb-warning-muted) text-(--nb-warning)",
  danger: "bg-(--nb-danger-muted) text-(--nb-danger)",
  outline: "border border-border bg-card text-foreground",
};

const SIZES: Record<string, string> = {
  small: "px-2 py-0.5 text-xs",
  medium: "px-2.5 py-0.5 text-[0.8125rem]",
  large: "px-3 py-1 text-sm",
};

/** The variants the picker offers, one per look; the aliases stay as written. */
const PICKED = ["default", "info", "success", "warning", "danger", "outline"];

/**
 * `<Badge text variant size />`: the pill as Nimbus draws it, its text edited in place. Nimbus
 * lists `leading-none` too, but its `cn()` drops it for the size's own line height.
 */
export function BadgeView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const props = node.attrs.props as JsxProp[];
  const update = (next: JsxProp[]) => updateAttributes({ props: next });
  const text = getProp(props, "text");
  const variant = getStringProp(props, "variant") ?? "default";
  const size = getStringProp(props, "size") ?? "small";
  return (
    <NodeViewWrapper as="span" className="relative inline-block align-baseline">
      <span
        contentEditable={false}
        className={`inline-flex items-center whitespace-nowrap rounded-full font-medium ${VARIANTS[variant] ?? VARIANTS.default} ${SIZES[size] ?? SIZES.small} ${selected ? "ring-2 ring-ring" : ""}`}
      >
        {text && text.kind !== "string" ? (
          <FixedProp name="text" value={text} />
        ) : (
          <input
            aria-label="Badge text"
            value={text?.value ?? ""}
            placeholder="Badge"
            spellCheck={false}
            className="field-sizing-content min-w-4 bg-transparent outline-none placeholder:text-current/60"
            onChange={(event) =>
              update(setProp(props, "text", { kind: "string", value: event.target.value }))
            }
          />
        )}
      </span>
      {selected && (
        <span
          contentEditable={false}
          className="absolute top-full left-0 z-10 mt-1 flex gap-1 rounded-md bg-card p-1 shadow-(--nb-shadow) ring ring-border"
        >
          {PICKED.map((option) => (
            <button
              key={option}
              type="button"
              aria-label={`${option} badge`}
              aria-pressed={VARIANTS[option] === VARIANTS[variant]}
              onClick={() =>
                update(
                  setProp(
                    props,
                    "variant",
                    option === "default" ? null : { kind: "string", value: option },
                  ),
                )
              }
              className={`size-4 cursor-pointer rounded-full aria-pressed:ring-2 aria-pressed:ring-ring ${VARIANTS[option]}`}
            />
          ))}
        </span>
      )}
    </NodeViewWrapper>
  );
}
