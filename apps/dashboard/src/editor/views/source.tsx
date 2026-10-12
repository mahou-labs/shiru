import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";

import { BlockLabel, CHROME } from "./fields";

const LANGUAGES: Record<string, "MDX" | "HTML"> = {
  mdxBlock: "MDX",
  mdxInline: "MDX",
  htmlBlock: "HTML",
  htmlInline: "HTML",
};

/** Raw MDX or HTML at block level, edited as the exact source it serializes to. */
export function RawBlockView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const language = LANGUAGES[node.type.name];
  const source: string = node.attrs.source;
  return (
    <NodeViewWrapper
      data-active={selected}
      className="group/block my-6 rounded-lg border border-dashed bg-muted/40 px-4 pt-2 pb-3"
    >
      <div contentEditable={false} className="flex flex-col gap-1">
        <BlockLabel>{language}</BlockLabel>
        <textarea
          aria-label={`${language} source`}
          value={source}
          rows={1}
          spellCheck={false}
          // A freshly inserted block is empty, and the author inserted it to type into it.
          autoFocus={source === ""}
          placeholder={language === "MDX" ? "<Component />" : "<div></div>"}
          className="field-sizing-content w-full resize-none bg-transparent font-mono text-sm/6 outline-none placeholder:text-muted-foreground/60"
          onChange={(event) => updateAttributes({ source: event.target.value })}
        />
      </div>
    </NodeViewWrapper>
  );
}

/** Inline JSX, HTML or an `{expression}`, as a chip that edits its source in place. */
export function RawInlineView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const language = LANGUAGES[node.type.name];
  return (
    <NodeViewWrapper
      as="span"
      title={`Inline ${language}`}
      className={`inline-flex items-baseline gap-1 rounded-md border px-1 align-baseline font-mono text-[0.8125em] ${selected ? "border-ring" : "border-dashed"} bg-muted/40`}
    >
      <span
        contentEditable={false}
        className="select-none text-[0.625rem] text-muted-foreground uppercase"
      >
        {language}
      </span>
      <textarea
        aria-label={`Inline ${language} source`}
        value={node.attrs.source}
        rows={1}
        spellCheck={false}
        className="field-sizing-content min-w-4 resize-none bg-transparent align-baseline outline-none"
        onChange={(event) => updateAttributes({ source: event.target.value })}
      />
    </NodeViewWrapper>
  );
}

/** A fenced code block with its language and the rest of the info string, such as `title="a.ts"`. */
export function CodeBlockView({ node, updateAttributes, selectionInside }: ReactNodeViewProps) {
  const { language, meta } = node.attrs as { language: string | null; meta: string | null };
  const field =
    "min-w-0 bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground/60";
  return (
    <NodeViewWrapper
      data-active={!!selectionInside}
      className="group/block my-6 rounded-lg border bg-muted/50"
    >
      <div
        contentEditable={false}
        className="flex items-center gap-3 px-4 pt-2 text-muted-foreground"
      >
        <input
          aria-label="Code language"
          value={language ?? ""}
          placeholder="Language"
          spellCheck={false}
          className={`field-sizing-content min-w-14 ${field} ${language ? "" : CHROME}`}
          onChange={(event) =>
            updateAttributes({ language: event.target.value.replace(/\s/g, "") || null })
          }
        />
        {(language || meta) && (
          <input
            aria-label="Code block meta"
            value={meta ?? ""}
            placeholder='title="file.ts"'
            spellCheck={false}
            className={`flex-1 ${field} ${meta ? "" : CHROME}`}
            onChange={(event) => updateAttributes({ meta: event.target.value || null })}
          />
        )}
      </div>
      <pre className="m-0! rounded-none! border-0! bg-transparent! px-4! pt-1! pb-3!">
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
