import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { IconPlusOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { useEffect, useState } from "react";

import { BlockLabel, CHROME, ICON_BUTTON, isActive } from "./fields";
import { Phosphor } from "./icon";

const ACCORDION_CHILD = (name: string) => ({
  type: "accordion",
  attrs: { props: [], layout: "block" },
  content: [
    {
      type: "accordionTrigger",
      attrs: { props: [], layout: "inline" },
      content: [{ type: "paragraph", content: [{ type: "text", text: name }] }],
    },
    {
      type: "accordionContent",
      attrs: { props: [], layout: "block" },
      content: [{ type: "paragraph" }],
    },
  ],
});

/** `<AccordionGroup>`: the accordions inside lose their own frame and share this one. */
export function AccordionGroupView(props: ReactNodeViewProps) {
  const { node, editor, getPos } = props;

  function addAccordion() {
    const pos = getPos();
    if (pos === undefined) return;
    const end = pos + node.nodeSize - 1;
    editor
      .chain()
      .insertContentAt(end, ACCORDION_CHILD("Question"))
      .setTextSelection(end + 3)
      .focus()
      .run();
  }

  return (
    <NodeViewWrapper
      data-nb-accordion-group=""
      data-active={isActive(props)}
      className="group/block relative my-4 rounded-lg bg-card ring ring-border"
    >
      <div
        contentEditable={false}
        className={`absolute -top-6 end-0 flex items-center gap-1 ${CHROME}`}
      >
        <button
          type="button"
          aria-label="Add accordion"
          onClick={addAccordion}
          className={ICON_BUTTON}
        >
          <IconPlusOutlineDuo18 />
        </button>
        <BlockLabel>Accordion group</BlockLabel>
      </div>
      <NodeViewContent className="overflow-hidden rounded-lg" />
    </NodeViewWrapper>
  );
}

/**
 * `<Accordion open>`. Open or closed is the editor's own state, so toggling it never edits the
 * page; it starts as the `open` prop says and opens whenever the cursor moves inside.
 */
export function AccordionView(props: ReactNodeViewProps) {
  const { node, selectionInside } = props;
  const startsOpen = (node.attrs.props as { name: string }[]).some((prop) => prop.name === "open");
  const [open, setOpen] = useState(startsOpen);

  useEffect(() => {
    if (selectionInside) setOpen(true);
  }, [selectionInside]);

  return (
    <NodeViewWrapper
      data-active={isActive(props)}
      data-nb-state={open ? "open" : "closed"}
      className="group/block nb-accordion relative my-3 overflow-hidden rounded-lg bg-card ring ring-border"
    >
      <button
        type="button"
        contentEditable={false}
        aria-label={open ? "Collapse" : "Expand"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="absolute top-3.5 right-[1.125rem] z-10 flex size-5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Phosphor
          name="caretRight"
          className={`h-4 w-4 transition-transform duration-[250ms] ease-[cubic-bezier(0.87,0,0.13,1)] motion-reduce:transition-none ${open ? "rotate-90 text-foreground" : ""}`}
        />
      </button>
      <NodeViewContent />
    </NodeViewWrapper>
  );
}

/** The trigger row; its label is the paragraph it holds, edited in place. */
export function AccordionTriggerView() {
  return (
    <NodeViewWrapper className="py-3.5 ps-5 pe-[2.875rem] font-medium text-foreground text-sm transition-colors duration-100 hover:bg-accent">
      <NodeViewContent className="[&_p]:m-0" />
    </NodeViewWrapper>
  );
}

export function AccordionContentView() {
  return (
    <NodeViewWrapper data-accordion-content="">
      <NodeViewContent className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed [&_p+p]:mt-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0" />
    </NodeViewWrapper>
  );
}
