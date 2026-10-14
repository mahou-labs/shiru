import { Button } from "@shiru/ui/components/button";
import { Toggle } from "@shiru/ui/components/toggle";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@shiru/ui/components/tooltip";
import { TextSelection } from "@tiptap/pm/state";
import { useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  IconCodeOutlineDuo18,
  IconLinkOutlineDuo18,
  IconLinkSlashOutlineDuo18,
  IconTextBoldOutlineDuo18,
  IconTextItalicOutlineDuo18,
  IconTextStrikethroughOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useState, type ComponentType, type ReactElement } from "react";

const MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** The inline marks the menu toggles, with the shortcut StarterKit already binds. */
const MARKS: {
  mark: "bold" | "italic" | "strike" | "code";
  label: string;
  keys: string;
  Icon: ComponentType;
}[] = [
  { mark: "bold", label: "Bold", keys: "B", Icon: IconTextBoldOutlineDuo18 },
  { mark: "italic", label: "Italic", keys: "I", Icon: IconTextItalicOutlineDuo18 },
  {
    mark: "strike",
    label: "Strikethrough",
    keys: "Shift+S",
    Icon: IconTextStrikethroughOutlineDuo18,
  },
  { mark: "code", label: "Inline code", keys: "E", Icon: IconCodeOutlineDuo18 },
];

function shortcut(keys: string) {
  return MAC ? `⌘${keys.replace("Shift+", "⇧")}` : `Ctrl+${keys}`;
}

function Tip({ label, keys, children }: { label: string; keys?: string; children: ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipPopup side="top" sideOffset={8}>
        <span className="flex items-center gap-2">
          {label}
          {keys && (
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {shortcut(keys)}
            </kbd>
          )}
        </span>
      </TooltipPopup>
    </Tooltip>
  );
}

/** Formatting for selected text: the marks Markdown has, and links. */
export function EditorBubbleMenu({ editor }: { editor: Editor }) {
  const [editingLink, setEditingLink] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      strike: editor.isActive("strike"),
      code: editor.isActive("code"),
      href: (editor.getAttributes("link").href as string | undefined) ?? null,
    }),
  });

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8, onHide: () => setEditingLink(false) }}
      shouldShow={({ editor, state }) =>
        editor.isEditable &&
        state.selection instanceof TextSelection &&
        !state.selection.empty &&
        !state.selection.$from.parent.type.spec.code
      }
    >
      <div className="flex items-center gap-px rounded-lg border bg-popover p-1 shadow-lg/5 not-dark:bg-clip-padding">
        {editingLink ? (
          <LinkForm
            href={state.href}
            onDone={(href) => {
              const chain = editor.chain().focus().extendMarkRange("link");
              if (href === null) chain.unsetLink().run();
              else if (href) chain.setLink({ href }).run();
              else chain.run();
              setEditingLink(false);
            }}
          />
        ) : (
          <>
            {MARKS.map(({ mark, label, keys, Icon }) => (
              <Tip key={mark} label={label} keys={keys}>
                <Toggle
                  size="sm"
                  aria-label={label}
                  pressed={state[mark]}
                  onPressedChange={() => editor.chain().focus().toggleMark(mark).run()}
                >
                  <Icon />
                </Toggle>
              </Tip>
            ))}
            <Tip label={state.href ? "Edit link" : "Link"}>
              <Toggle
                size="sm"
                aria-label={state.href ? "Edit link" : "Link"}
                pressed={state.href !== null}
                onPressedChange={() => setEditingLink(true)}
              >
                <IconLinkOutlineDuo18 />
              </Toggle>
            </Tip>
          </>
        )}
      </div>
    </BubbleMenu>
  );
}

/** Sets, edits or removes the link. `onDone(null)` removes it, an empty string cancels. */
function LinkForm({
  href,
  onDone,
}: {
  href: string | null;
  onDone: (href: string | null) => void;
}) {
  const [value, setValue] = useState(href ?? "");
  return (
    <form
      className="flex items-center gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        onDone(value.trim() || (href ? null : ""));
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onDone("");
      }}
    >
      <input
        autoFocus
        aria-label="Link URL"
        placeholder="Paste or type a link"
        value={value}
        spellCheck={false}
        className="h-7 w-60 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/72"
        onChange={(event) => setValue(event.target.value)}
      />
      <Button type="submit" size="xs" variant="ghost">
        {href ? "Save" : "Add"}
      </Button>
      {href && (
        <Tip label="Remove link">
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label="Remove link"
            onClick={() => onDone(null)}
          >
            <IconLinkSlashOutlineDuo18 />
          </Button>
        </Tip>
      )}
    </form>
  );
}
