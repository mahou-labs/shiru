import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@shiru/ui/components/menu";
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import type { CSSProperties, ReactNode } from "react";

import type { AdmonitionAttrs } from "../nodes/admonition";
import type { ComponentAttrs } from "../nodes/components";
import { getProp, setProp } from "../nodes/props";
import { FixedProp, PropField } from "./fields";

/** The four callout types Nimbus styles, in the order the picker lists them. */
export const CALLOUT_TYPES = ["note", "tip", "caution", "danger"] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

/** Nimbus's Aside config and its Phosphor icons: `ph:info`, `ph:lightbulb`, `ph:warning` and `ph:warning-circle`. */
const TONES: Record<CalloutType, { label: string; color: string; tint: string; icon: string }> = {
  note: {
    label: "Note",
    color: "var(--nb-info)",
    tint: "var(--nb-info-muted)",
    icon: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m16-40a8 8 0 0 1-8 8a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 8 8m-32-92a12 12 0 1 1 12 12a12 12 0 0 1-12-12",
  },
  tip: {
    label: "Tip",
    color: "var(--nb-success)",
    tint: "var(--nb-success-muted)",
    icon: "M176 232a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h80a8 8 0 0 1 8 8m40-128a87.55 87.55 0 0 1-33.64 69.21A16.24 16.24 0 0 0 176 186v6a16 16 0 0 1-16 16H96a16 16 0 0 1-16-16v-6a16 16 0 0 0-6.23-12.66A87.59 87.59 0 0 1 40 104.49C39.74 56.83 78.26 17.14 125.88 16A88 88 0 0 1 216 104m-16 0a72 72 0 0 0-73.74-72c-39 .92-70.47 33.39-70.26 72.39a71.65 71.65 0 0 0 27.64 56.3A32 32 0 0 1 96 186v6h64v-6a32.15 32.15 0 0 1 12.47-25.35A71.65 71.65 0 0 0 200 104m-16.11-9.34a57.6 57.6 0 0 0-46.56-46.55a8 8 0 0 0-2.66 15.78c16.57 2.79 30.63 16.85 33.44 33.45A8 8 0 0 0 176 104a9 9 0 0 0 1.35-.11a8 8 0 0 0 6.54-9.23",
  },
  caution: {
    label: "Caution",
    color: "var(--nb-warning)",
    tint: "var(--nb-warning-muted)",
    icon: "M236.8 188.09L149.35 36.22a24.76 24.76 0 0 0-42.7 0L19.2 188.09a23.51 23.51 0 0 0 0 23.72A24.35 24.35 0 0 0 40.55 224h174.9a24.35 24.35 0 0 0 21.33-12.19a23.51 23.51 0 0 0 .02-23.72m-13.87 15.71a8.5 8.5 0 0 1-7.48 4.2H40.55a8.5 8.5 0 0 1-7.48-4.2a7.59 7.59 0 0 1 0-7.72l87.45-151.87a8.75 8.75 0 0 1 15 0l87.45 151.87a7.59 7.59 0 0 1-.04 7.72M120 144v-40a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0m20 36a12 12 0 1 1-12-12a12 12 0 0 1 12 12",
  },
  danger: {
    label: "Danger",
    color: "var(--nb-danger)",
    tint: "var(--nb-danger-muted)",
    icon: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m-8-80V80a8 8 0 0 1 16 0v56a8 8 0 0 1-16 0m20 36a12 12 0 1 1-12-12a12 12 0 0 1 12 12",
  },
};

/** Admonition keywords Nimbus accepts beyond the four types, mapped as its admonition transform maps them. */
const KEYWORD_TONES: Record<string, CalloutType> = {
  info: "note",
  important: "caution",
  warning: "caution",
};

function toneOf(type: string | null): CalloutType {
  if (type && (CALLOUT_TYPES as readonly string[]).includes(type)) return type as CalloutType;
  return (type && KEYWORD_TONES[type]) || "note";
}

type CalloutProps = {
  type: string;
  /** Null when the type cannot be changed here, as when it is an expression. */
  onType: ((type: CalloutType) => void) | null;
  title: ReactNode;
  active: boolean;
};

/** Nimbus's Aside: icon, then the title over the body, on the type's tint. */
function Callout({ type, onType, title, active }: CalloutProps) {
  const tone = TONES[toneOf(type)];
  const icon = (
    <svg width="1em" height="1em" viewBox="0 0 256 256" aria-hidden="true">
      <path fill="currentColor" d={tone.icon} />
    </svg>
  );
  return (
    <NodeViewWrapper
      as="aside"
      data-active={active}
      className="group/block aside-card my-4 flex items-start gap-3 rounded-lg px-4 py-3"
      style={{ "--_c": tone.color, "--_t": tone.tint } as CSSProperties}
    >
      <span contentEditable={false} className="flex h-[1.375em] shrink-0 items-center">
        {onType ? (
          <Menu>
            <MenuTrigger
              aria-label={`${tone.label}. Change the callout type`}
              className="flex cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {icon}
            </MenuTrigger>
            <MenuPopup align="start">
              <MenuRadioGroup value={type} onValueChange={(next: CalloutType) => onType(next)}>
                {CALLOUT_TYPES.map((option) => (
                  <MenuRadioItem key={option} value={option}>
                    {TONES[option].label}
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
            </MenuPopup>
          </Menu>
        ) : (
          icon
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div contentEditable={false} className="flex items-center gap-2">
          {title}
        </div>
        <NodeViewContent className="aside-card-body text-sm leading-normal" />
      </div>
    </NodeViewWrapper>
  );
}

/**
 * Reads like the title Nimbus shows, which falls back to the type's label when there is none. Its
 * `text-base` loses to the site's prose rule for classed paragraphs, so the size is the body's.
 */
const TITLE = "w-full font-semibold leading-snug placeholder:text-(--_c)!";

/** `:::note[Title]`. The keyword and the bracketed title are node attributes. */
export function AdmonitionView({
  node,
  updateAttributes,
  selected,
  selectionInside,
}: ReactNodeViewProps) {
  const { keyword, title } = node.attrs as AdmonitionAttrs;
  return (
    <Callout
      type={keyword}
      active={selected || !!selectionInside}
      onType={(next) => updateAttributes({ keyword: next })}
      title={
        <input
          aria-label="Callout title"
          value={title ?? ""}
          placeholder={TONES[toneOf(keyword)].label}
          spellCheck={false}
          className={`min-w-0 bg-transparent outline-none ${TITLE}`}
          onChange={(event) => updateAttributes({ title: event.target.value || null })}
        />
      }
    />
  );
}

/** `<Aside type title>`. Both are props, so an expression stays as written. */
export function AsideView({
  node,
  updateAttributes,
  selected,
  selectionInside,
}: ReactNodeViewProps) {
  const { props } = node.attrs as ComponentAttrs;
  const type = getProp(props, "type");
  const editable = !type || type.kind === "string";
  const typeName = type?.kind === "string" ? type.value : "note";
  return (
    <Callout
      type={typeName}
      active={selected || !!selectionInside}
      onType={
        editable
          ? (next) =>
              updateAttributes({ props: setProp(props, "type", { kind: "string", value: next }) })
          : null
      }
      title={
        <>
          <PropField
            aria-label="Aside title"
            props={props}
            name="title"
            placeholder={TONES[toneOf(typeName)].label}
            className={TITLE}
            onChange={(next) => updateAttributes({ props: next })}
          />
          {type && !editable && <FixedProp name="type" value={type} />}
        </>
      }
    />
  );
}
