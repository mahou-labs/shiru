import { Extension, type Editor, ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions, type SuggestionProps } from "@tiptap/suggestion";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  IconAlertInfoOutlineDuo18,
  IconBlockquoteOutlineDuo18,
  IconBulletListOutlineDuo18,
  IconCheckListOutlineDuo18,
  IconDividerXOutlineDuo18,
  IconHeading1OutlineDuo18,
  IconHeading2OutlineDuo18,
  IconHeading3OutlineDuo18,
  IconOrderedListOutlineDuo18,
  IconParagraphOutlineDuo18,
  IconSquareCodeOutlineDuo18,
} from "nucleo-ui-outline-duo-18";

// ---------------------------------------------------------------------------
// Command item types
// ---------------------------------------------------------------------------

type CommandItem = {
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  command: (props: { editor: Editor; range: { from: number; to: number } }) => void;
};

// ---------------------------------------------------------------------------
// Command definitions
// ---------------------------------------------------------------------------

const commands: CommandItem[] = [
  {
    title: "Text",
    description: "Plain text paragraph",
    icon: IconParagraphOutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: IconHeading1OutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: IconHeading2OutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: IconHeading3OutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Unordered list of items",
    icon: IconBulletListOutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Ordered list of items",
    icon: IconOrderedListOutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Task List",
    description: "Checklist with to-dos",
    icon: IconCheckListOutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Callout",
    description: "Info, warning, or tip block",
    icon: IconAlertInfoOutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCallout({ type: "info" }).run();
    },
  },
  {
    title: "Blockquote",
    description: "Highlighted quote block",
    icon: IconBlockquoteOutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Syntax-highlighted code",
    icon: IconSquareCodeOutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Divider",
    description: "Horizontal separator",
    icon: IconDividerXOutlineDuo18,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

// ---------------------------------------------------------------------------
// React component for the slash command list
// ---------------------------------------------------------------------------

type SlashCommandListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

type SlashCommandListProps = SuggestionProps<CommandItem, CommandItem>;

const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  function SlashCommandList(props, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Reset selection when items change
    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    // Scroll selected item into view
    useLayoutEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const selected = container.querySelector<HTMLElement>("[data-selected]");
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }, [selectedIndex]);

    const selectItem = useCallback(
      (index: number) => {
        const item = props.items[index];
        if (item) {
          props.command(item);
        }
      },
      [props],
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev + props.items.length - 1) % props.items.length);
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % props.items.length);
          return true;
        }

        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    if (props.items.length === 0) {
      return (
        <div className="slash-command-menu">
          <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
        </div>
      );
    }

    return (
      <div className="slash-command-menu" ref={scrollContainerRef}>
        {props.items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.title}
              className={`slash-command-item ${index === selectedIndex ? "is-selected" : ""}`}
              data-selected={index === selectedIndex ? "" : undefined}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="slash-command-item-icon">
                <Icon />
              </div>
              <div className="slash-command-item-content">
                <span className="slash-command-item-title">{item.title}</span>
                <span className="slash-command-item-description">{item.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Suggestion render config (imperative DOM positioning, no tippy.js)
// ---------------------------------------------------------------------------

function createSuggestionRender(): SuggestionOptions<CommandItem, CommandItem>["render"] {
  return () => {
    let component: ReactRenderer<SlashCommandListRef, SlashCommandListProps> | null = null;
    let portalContainer: HTMLDivElement | null = null;

    function updatePosition(props: SuggestionProps<CommandItem, CommandItem>) {
      const rect = props.clientRect?.();
      if (!rect || !portalContainer) return;

      let top = rect.bottom + 4;
      let left = rect.left;

      // Flip above if overflowing bottom
      const menuHeight = portalContainer.offsetHeight || 320;
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }

      // Clamp horizontal
      const menuWidth = portalContainer.offsetWidth || 256;
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      portalContainer.style.top = `${top}px`;
      portalContainer.style.left = `${left}px`;
    }

    return {
      onStart: (props) => {
        component = new ReactRenderer(SlashCommandList, {
          props,
          editor: props.editor,
        });

        portalContainer = document.createElement("div");
        portalContainer.style.position = "fixed";
        portalContainer.style.zIndex = "50";
        document.body.appendChild(portalContainer);
        portalContainer.appendChild(component.element as Node);

        updatePosition(props);
      },

      onUpdate: (props) => {
        component?.updateProps(props);
        updatePosition(props);
      },

      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          portalContainer?.remove();
          portalContainer = null;
          component?.destroy();
          component = null;
          return true;
        }

        return component?.ref?.onKeyDown(props) ?? false;
      },

      onExit: () => {
        portalContainer?.remove();
        portalContainer = null;
        component?.destroy();
        component = null;
      },
    };
  };
}

// ---------------------------------------------------------------------------
// Tiptap extension
// ---------------------------------------------------------------------------

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        items: ({ query }: { query: string }) => {
          return commands.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
        },
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: { from: number; to: number };
          props: CommandItem;
        }) => {
          props.command({ editor, range });
        },
        render: createSuggestionRender(),
      } satisfies Omit<SuggestionOptions<CommandItem, CommandItem>, "editor">,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
