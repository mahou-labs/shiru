import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import type { CSSProperties, ReactNode } from "react";

import type { ComponentAttrs } from "../nodes/components";
import { getProp, getStringProp, type JsxProp } from "../nodes/props";
import { BlockLabel, CHROME, FixedProp, isActive, PropField, REVEAL } from "./fields";
import { Phosphor } from "./icon";

/** Nimbus's `button/variants.ts`, which LinkButton and CopyPrompt share. */
const BUTTON_BASE =
  "group/button inline-flex w-max shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap no-underline transition-all cursor-pointer select-none";

const BUTTON_VARIANTS: Record<string, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-(--nb-shadow-sm) hover:bg-(--nb-primary-hover) hover:shadow-(--nb-shadow)",
  secondary:
    "bg-card text-foreground ring ring-border shadow-(--nb-shadow-sm) hover:bg-accent hover:ring-(--nb-border-strong)",
  ghost: "bg-transparent text-foreground shadow-none hover:bg-accent",
  destructive: "bg-(--nb-danger) text-white shadow-(--nb-shadow-sm)",
  "secondary-destructive":
    "bg-card text-(--nb-danger) ring ring-border shadow-(--nb-shadow-sm) hover:bg-accent",
  outline: "bg-transparent text-foreground ring ring-border hover:ring-(--nb-border-strong)",
};

const BUTTON_SIZES: Record<string, string> = {
  xs: "gap-1 px-2 py-1 text-xs",
  sm: "gap-1 px-3 py-1.5 text-xs",
  base: "gap-1.5 px-4 py-2 text-sm",
  lg: "gap-2 px-5 py-2.5 text-sm",
};

const BUTTON_ICON_SIZES: Record<string, string> = {
  xs: "h-3.5 w-3.5",
  sm: "h-3.5 w-3.5",
  base: "h-4 w-4",
  lg: "h-[1.125rem] w-[1.125rem]",
};

function buttonClasses(variant: string, size: string): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.secondary} ${BUTTON_SIZES[size] ?? BUTTON_SIZES.base}`;
}

/** Props edited under a block, shown only while it is, since the published block has none. */
function PropsRow({ children }: { children: ReactNode }) {
  return (
    <div
      contentEditable={false}
      className="mt-2 hidden flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs group-focus-within/block:flex group-data-[active=true]/block:flex"
    >
      {children}
    </div>
  );
}

const FIELD =
  "field-sizing-content min-w-16 rounded-md border border-transparent px-1.5 py-0.5 font-mono text-foreground hover:border-input focus:border-input";

function Field({
  label,
  props,
  name,
  placeholder,
  required,
  onChange,
}: {
  label: string;
  props: JsxProp[];
  name: string;
  placeholder: string;
  required?: boolean;
  onChange: (props: JsxProp[]) => void;
}) {
  return (
    <label className="flex items-center gap-1">
      {label}
      <PropField
        props={props}
        name={name}
        placeholder={placeholder}
        required={required}
        className={FIELD}
        onChange={onChange}
      />
    </label>
  );
}

function useProps({ node, updateAttributes }: ReactNodeViewProps) {
  const { props } = node.attrs as ComponentAttrs;
  return { props, update: (next: JsxProp[]) => updateAttributes({ props: next }) };
}

/** `<CopyPrompt text>`: the prompt on one line beside a Copy prompt button. */
export function CopyPromptView(props: ReactNodeViewProps) {
  const { props: attrs, update } = useProps(props);
  const text = getStringProp(attrs, "text") ?? "";
  return (
    <NodeViewWrapper
      data-copy-prompt=""
      data-active={isActive(props)}
      contentEditable={false}
      className="group/block my-6 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 sm:gap-4"
    >
      <PropField
        aria-label="Prompt"
        props={attrs}
        name="text"
        required
        placeholder="The prompt readers copy"
        className="m-0 block flex-1 truncate text-foreground"
        onChange={update}
      />
      <button
        type="button"
        onClick={() => void navigator.clipboard.writeText(text)}
        className={buttonClasses("primary", "base")}
      >
        Copy prompt
      </button>
    </NodeViewWrapper>
  );
}

/** `<Embed src title ratio>`: the live iframe at its ratio. */
export function EmbedView(props: ReactNodeViewProps) {
  const { props: attrs, update } = useProps(props);
  const src = getStringProp(attrs, "src");
  const ratio = getStringProp(attrs, "ratio") ?? "16/9";
  return (
    <NodeViewWrapper
      data-embed=""
      data-active={isActive(props)}
      contentEditable={false}
      className="group/block my-4"
    >
      <div
        className="overflow-hidden rounded-lg border border-border bg-muted"
        style={{ aspectRatio: ratio }}
      >
        {src ? (
          <iframe
            src={src}
            title={getStringProp(attrs, "title") ?? "Embedded content"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="block h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Add the URL to embed
          </div>
        )}
      </div>
      <PropsRow>
        <Field
          label="URL"
          props={attrs}
          name="src"
          placeholder="https://"
          required
          onChange={update}
        />
        <Field
          label="Title"
          props={attrs}
          name="title"
          placeholder="What it shows"
          required
          onChange={update}
        />
        <Field label="Ratio" props={attrs} name="ratio" placeholder="16/9" onChange={update} />
      </PropsRow>
    </NodeViewWrapper>
  );
}

/** `<FileTree>` around a nested list; `nodes/file-tree.ts` marks folders, files and placeholders. */
export function FileTreeView(props: ReactNodeViewProps) {
  return (
    <NodeViewWrapper data-active={isActive(props)} className="group/block file-tree relative">
      <BlockLabel className={`absolute -top-5 end-0 ${CHROME}`}>File tree</BlockLabel>
      <NodeViewContent />
    </NodeViewWrapper>
  );
}

/** `<Frame caption aspect>` around an image or other media. */
export function FrameView(props: ReactNodeViewProps) {
  const { props: attrs, update } = useProps(props);
  const aspect = getStringProp(attrs, "aspect");
  const captioned = getProp(attrs, "caption") !== undefined;
  return (
    <NodeViewWrapper
      as="figure"
      data-active={isActive(props)}
      data-frame-aspect={aspect}
      style={aspect ? ({ "--frame-aspect": aspect } as CSSProperties) : undefined}
      className="group/block frame"
    >
      <NodeViewContent className="frame-media" />
      <div contentEditable={false} className={captioned ? undefined : REVEAL}>
        <PropField
          aria-label="Caption"
          props={attrs}
          name="caption"
          placeholder="Caption"
          className="frame-caption block w-full"
          onChange={update}
        />
      </div>
    </NodeViewWrapper>
  );
}

/** `<LinkButton href variant size icon>`: its label is the paragraph it holds. */
export function LinkButtonView(props: ReactNodeViewProps) {
  const { props: attrs, update } = useProps(props);
  const variant = getStringProp(attrs, "variant") ?? "primary";
  const size = getStringProp(attrs, "size") ?? "md";
  const resolvedSize = size === "md" ? "base" : size;
  const icon = getProp(attrs, "icon");
  return (
    <NodeViewWrapper data-link-button="" data-active={isActive(props)} className="group/block">
      <div className={buttonClasses(variant === "minimal" ? "ghost" : variant, resolvedSize)}>
        <NodeViewContent className="[&_p]:m-0" />
        {icon && (
          <Phosphor
            name="caretRight"
            className={`${BUTTON_ICON_SIZES[resolvedSize] ?? BUTTON_ICON_SIZES.base} shrink-0 transition-transform group-hover/button:translate-x-0.5`}
          />
        )}
      </div>
      <PropsRow>
        <Field
          label="Link"
          props={attrs}
          name="href"
          placeholder="/page"
          required
          onChange={update}
        />
        <Field
          label="Variant"
          props={attrs}
          name="variant"
          placeholder="primary"
          onChange={update}
        />
        {icon?.kind === "expression" && <FixedProp name="icon" value={icon} />}
      </PropsRow>
    </NodeViewWrapper>
  );
}

/**
 * `<LinkCard title description href>`: a card that reads as a link, with a trailing caret. The
 * description's `mt-1 text-sm` lose to the site's prose rule for classed paragraphs, so it has none.
 */
export function LinkCardView(props: ReactNodeViewProps) {
  const { props: attrs, update } = useProps(props);
  const described = getProp(attrs, "description") !== undefined;
  return (
    <NodeViewWrapper
      data-link-card=""
      data-active={isActive(props)}
      contentEditable={false}
      className="group/block"
    >
      <div className="group/link flex items-center justify-between gap-3 rounded-lg bg-card p-5 text-inherit shadow-(--nb-shadow-sm) ring ring-border transition-all hover:shadow-(--nb-shadow) hover:ring-(--nb-border-strong)">
        <div className="min-w-0 flex-1">
          <PropField
            aria-label="Link card title"
            props={attrs}
            name="title"
            required
            placeholder="Title"
            className="m-0 block w-full font-semibold text-foreground leading-snug transition-colors group-hover/link:text-primary"
            onChange={update}
          />
          <div className={described ? undefined : REVEAL}>
            <PropField
              aria-label="Link card description"
              props={attrs}
              name="description"
              placeholder="Description"
              className="block w-full text-muted-foreground leading-normal"
              onChange={update}
            />
          </div>
        </div>
        <Phosphor
          name="caretRight"
          className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover/link:translate-x-0.5 group-hover/link:text-primary"
        />
      </div>
      <PropsRow>
        <Field
          label="Link"
          props={attrs}
          name="href"
          placeholder="/page"
          required
          onChange={update}
        />
      </PropsRow>
    </NodeViewWrapper>
  );
}
