import { Button } from "@shiru/ui/components/button";
import { Input } from "@shiru/ui/components/input";
import { Extension, type Editor, type JSONContent, type Range } from "@tiptap/core";
import { PluginKey, Selection, TextSelection, type Transaction } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import {
  IconBlockquoteOutlineDuo18,
  IconTag2OutlineDuo18,
  IconBracketsCurlyOutlineDuo18,
  IconBulletListOutlineDuo18,
  IconCardsOutlineDuo18,
  IconCheckListOutlineDuo18,
  IconChevronDownOutlineDuo18,
  IconChevronExpandYOutlineDuo18,
  IconCode2OutlineDuo18,
  IconFileTreeOutlineDuo18,
  IconFrameOutlineDuo18,
  IconLink2OutlineDuo18,
  IconLink3OutlineDuo18,
  IconSparkleOutlineDuo18,
  IconVideoOutlineDuo18,
  IconCircleInfoOutlineDuo18,
  IconDividerXOutlineDuo18,
  IconHeading1OutlineDuo18,
  IconHeading2OutlineDuo18,
  IconHeading3OutlineDuo18,
  IconImageOutlineDuo18,
  IconLightbulbOutlineDuo18,
  IconAlertWarningOutlineDuo18,
  IconOctagonWarningOutlineDuo18,
  IconOrderedListOutlineDuo18,
  IconParagraphOutlineDuo18,
  IconSquareCodeOutlineDuo18,
  IconStepsIndicatorOutlineDuo18,
  IconTableOutlineDuo18,
  IconTabsOutlineDuo18,
  IconTerminalOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";

import type { Flavor } from "./markdown";
import { matchTemplates, type Template } from "./templates";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  paragraph: IconParagraphOutlineDuo18,
  heading1: IconHeading1OutlineDuo18,
  heading2: IconHeading2OutlineDuo18,
  heading3: IconHeading3OutlineDuo18,
  bulletList: IconBulletListOutlineDuo18,
  orderedList: IconOrderedListOutlineDuo18,
  taskList: IconCheckListOutlineDuo18,
  blockquote: IconBlockquoteOutlineDuo18,
  codeBlock: IconSquareCodeOutlineDuo18,
  table: IconTableOutlineDuo18,
  horizontalRule: IconDividerXOutlineDuo18,
  image: IconImageOutlineDuo18,
  note: IconCircleInfoOutlineDuo18,
  tip: IconLightbulbOutlineDuo18,
  caution: IconAlertWarningOutlineDuo18,
  danger: IconOctagonWarningOutlineDuo18,
  tabs: IconTabsOutlineDuo18,
  steps: IconStepsIndicatorOutlineDuo18,
  cardGrid: IconCardsOutlineDuo18,
  packageManagers: IconTerminalOutlineDuo18,
  accordion: IconChevronExpandYOutlineDuo18,
  accordionGroup: IconChevronDownOutlineDuo18,
  codeGroup: IconCode2OutlineDuo18,
  copyPrompt: IconSparkleOutlineDuo18,
  embed: IconVideoOutlineDuo18,
  fileTree: IconFileTreeOutlineDuo18,
  frame: IconFrameOutlineDuo18,
  linkButton: IconLink2OutlineDuo18,
  linkCard: IconLink3OutlineDuo18,
  badge: IconTag2OutlineDuo18,
  mdx: IconBracketsCurlyOutlineDuo18,
};

type Image = { src: string; alt: string };
type Choice = { template: Template; image?: Image };

const slashMenuKey = new PluginKey("slashMenu");

function withImage(content: JSONContent, image: Image): JSONContent {
  if (content.type === "image") return { ...content, attrs: { ...content.attrs, ...image } };
  return { ...content, content: content.content?.map((child) => withImage(child, image)) };
}

/**
 * Puts the cursor where the author continues: the first text block of what was inserted, with its
 * placeholder text selected so typing replaces it. After an atom, the block that follows it.
 */
function selectInserted(tr: Transaction) {
  let start = 0;
  let end = 0;
  tr.steps[tr.steps.length - 1].getMap().forEach((_from, _to, newStart, newEnd) => {
    start = newStart;
    end = newEnd;
  });
  let selection: Selection | null = null;
  let atomEnd = -1;
  tr.doc.nodesBetween(start, end, (node, pos) => {
    if (selection) return false;
    if (pos < start) return true;
    if (node.isTextblock) {
      selection = TextSelection.create(tr.doc, pos + 1, pos + 1 + node.content.size);
      return false;
    }
    if (node.isAtom && node.isBlock && atomEnd < 0) atomEnd = pos + node.nodeSize;
    return true;
  });
  if (!selection && atomEnd >= 0) {
    if (!tr.doc.nodeAt(atomEnd)?.isTextblock) {
      tr.insert(atomEnd, tr.doc.type.schema.nodes.paragraph.create());
    }
    selection = TextSelection.create(tr.doc, atomEnd + 1);
  }
  if (selection) tr.setSelection(selection);
}

function insertTemplate(editor: Editor, range: Range, { template, image }: Choice) {
  editor
    .chain()
    .focus()
    .deleteRange(range)
    .insertContentAt(range.from, image ? withImage(template.content, image) : template.content)
    .command(({ tr }) => {
      selectInserted(tr);
      return true;
    })
    .scrollIntoView()
    .run();
}

type MenuHandle = { onKeyDown: (event: KeyboardEvent) => boolean };
type MenuProps = SuggestionProps<Template, Choice>;

const ITEM =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-start outline-none";

const SlashMenuList = forwardRef<MenuHandle, MenuProps>(function SlashMenuList(props, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [asking, setAsking] = useState<Template | null>(null);
  const [items, setItems] = useState(props.items);
  const list = useRef<HTMLDivElement>(null);
  // A new query starts the highlight over at the best match.
  if (items !== props.items) {
    setItems(props.items);
    setSelectedIndex(0);
  }

  useLayoutEffect(() => {
    list.current?.querySelector("[data-selected]")?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  function choose(index: number) {
    const template = props.items[index];
    if (!template) return;
    if (template.asksForImage) setAsking(template);
    else props.command({ template });
  }

  useImperativeHandle(ref, () => ({
    onKeyDown(event) {
      const count = props.items.length;
      if (asking || !count) return false;
      if (event.key === "ArrowUp") {
        setSelectedIndex((index) => (index + count - 1) % count);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((index) => (index + 1) % count);
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        choose(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  const popup =
    "w-72 rounded-lg border bg-popover text-popover-foreground shadow-lg/5 not-dark:bg-clip-padding";

  if (asking) {
    return (
      <ImageForm
        className={popup}
        onCancel={() => {
          setAsking(null);
          props.editor.commands.focus();
        }}
        onSubmit={(image) => props.command({ template: asking, image })}
      />
    );
  }

  if (!props.items.length) {
    return <div className={`${popup} px-3 py-2 text-muted-foreground text-sm`}>No results</div>;
  }

  return (
    <div
      ref={list}
      role="listbox"
      aria-label="Insert a block"
      className={`${popup} flex max-h-80 flex-col gap-px overflow-y-auto p-1.5`}
    >
      {props.items.map((template, index) => {
        const Icon = ICONS[template.id] ?? IconParagraphOutlineDuo18;
        const selected = index === selectedIndex;
        return (
          <button
            type="button"
            role="option"
            aria-selected={selected}
            key={template.id}
            data-selected={selected || undefined}
            className={`${ITEM} ${selected ? "bg-accent" : ""}`}
            // Keeps the editor's selection, so the command still knows where the slash was.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => choose(index)}
            onMouseMove={() => setSelectedIndex(index)}
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-md border bg-card ${selected ? "text-foreground" : "text-muted-foreground"}`}
            >
              <Icon className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="font-medium text-[0.8125rem] text-foreground leading-tight">
                {template.label}
              </span>
              <span className="truncate text-muted-foreground text-xs leading-tight">
                {template.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
});

function ImageForm({
  className,
  onCancel,
  onSubmit,
}: {
  className: string;
  onCancel: () => void;
  onSubmit: (image: Image) => void;
}) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  return (
    <form
      className={`${className} flex flex-col gap-2 p-3`}
      onSubmit={(event) => {
        event.preventDefault();
        if (src.trim()) onSubmit({ src: src.trim(), alt });
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onCancel();
      }}
    >
      <Input
        autoFocus
        size="sm"
        aria-label="Image URL"
        placeholder="https://… or /images/diagram.png"
        value={src}
        onChange={(event) => setSrc(event.target.value)}
      />
      <Input
        size="sm"
        aria-label="Alt text"
        placeholder="Describe the image"
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" size="xs" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="xs" disabled={!src.trim()}>
          Insert image
        </Button>
      </div>
    </form>
  );
}

/** Typing `/` opens a menu of the blocks this page's flavor can hold. */
export function slashMenu(flavor: Flavor) {
  return Extension.create({
    name: "slashMenu",
    addProseMirrorPlugins() {
      return [
        Suggestion<Template, Choice>({
          editor: this.editor,
          pluginKey: slashMenuKey,
          char: "/",
          // Table cells serialize to one line of inline text, so blocks cannot go there.
          allow: ({ state, range }) => {
            const $from = state.doc.resolve(range.from);
            if ($from.parent.type.name !== "paragraph") return false;
            for (let depth = $from.depth; depth > 0; depth--) {
              if ($from.node(depth).type.spec.tableRole) return false;
            }
            return true;
          },
          items: ({ query }) => matchTemplates(flavor, query),
          command: ({ editor, range, props }) => insertTemplate(editor, range, props),
          render() {
            let menu: ReactRenderer<MenuHandle, MenuProps> | null = null;
            let unmount: (() => void) | null = null;
            return {
              onStart(props) {
                menu = new ReactRenderer(SlashMenuList, { props, editor: props.editor });
                (menu.element as HTMLElement).style.zIndex = "50";
                unmount = props.mount(menu.element as HTMLElement);
              },
              onUpdate: (props) => menu?.updateProps(props),
              onKeyDown: ({ event }) => menu?.ref?.onKeyDown(event) ?? false,
              onExit() {
                unmount?.();
                menu?.destroy();
                menu = null;
              },
            };
          },
        }),
      ];
    },
  });
}

/** Opens the slash menu at an empty paragraph, as typing `/` there would. */
export function openSlashMenu(editor: Editor, paragraphStart: number) {
  editor.chain().focus().setTextSelection(paragraphStart).insertContent("/").run();
}
