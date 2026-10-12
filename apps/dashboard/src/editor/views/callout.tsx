import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@shiru/ui/components/menu";
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import {
  IconAlertInfoOutlineDuo18,
  IconAlertWarningOutlineDuo18,
  IconLightbulbOutlineDuo18,
  IconOctagonWarningOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import type { ComponentType, ReactNode } from "react";

import type { AdmonitionAttrs } from "../nodes/admonition";
import type { ComponentAttrs } from "../nodes/components";
import { getProp, setProp } from "../nodes/props";
import { FixedProp, PropField } from "./fields";

/** The four callout types Nimbus styles, in the order the picker lists them. */
export const CALLOUT_TYPES = ["note", "tip", "caution", "danger"] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

/** The only place the editor uses color: each callout type keeps its semantic tint, as on the doc. */
const TONES: Record<
  CalloutType,
  { label: string; Icon: ComponentType<{ className?: string }>; className: string }
> = {
  note: {
    label: "Note",
    Icon: IconAlertInfoOutlineDuo18,
    className: "border-info/24 bg-info/6 [--tone:var(--color-info-foreground)]",
  },
  tip: {
    label: "Tip",
    Icon: IconLightbulbOutlineDuo18,
    className: "border-success/24 bg-success/6 [--tone:var(--color-success-foreground)]",
  },
  caution: {
    label: "Caution",
    Icon: IconAlertWarningOutlineDuo18,
    className: "border-warning/28 bg-warning/8 [--tone:var(--color-warning-foreground)]",
  },
  danger: {
    label: "Danger",
    Icon: IconOctagonWarningOutlineDuo18,
    className:
      "border-destructive/24 bg-destructive/6 [--tone:var(--color-destructive-foreground)]",
  },
};

/** Admonition keywords Nimbus accepts beyond the four types, styled as the closest type. */
const KEYWORD_TONES: Record<string, CalloutType> = {
  info: "note",
  important: "note",
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

/** Laid out like Nimbus's Aside: icon, then the title over the body, on the type's tint. */
function Callout({ type, onType, title, active }: CalloutProps) {
  const tone = TONES[toneOf(type)];
  const icon = <tone.Icon className="size-4.5" />;
  return (
    <NodeViewWrapper
      data-active={active}
      className={`group/block my-6 flex items-start gap-3 rounded-lg border px-4 py-3 ${tone.className}`}
    >
      <div contentEditable={false} className="flex h-7 shrink-0 items-center text-(--tone)">
        {onType ? (
          <Menu>
            <MenuTrigger
              aria-label={`${tone.label}. Change the callout type`}
              className="-m-1 flex cursor-pointer rounded-md p-1 outline-none transition-colors hover:bg-(--tone)/10 focus-visible:ring-2 focus-visible:ring-ring"
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
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div contentEditable={false} className="flex h-7 items-center gap-2">
          {title}
        </div>
        <NodeViewContent className="text-[0.9375rem]/6.5 [&_p]:my-0 [&_p+p]:mt-2" />
      </div>
    </NodeViewWrapper>
  );
}

const TITLE = "w-full font-semibold text-(--tone) placeholder:text-(--tone)/60";

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
