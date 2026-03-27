import { Toggle } from "@shiru/ui/toggle";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@shiru/ui/tooltip";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  IconCodeOutlineDuo18,
  IconHighlighterOutlineDuo18,
  IconTextBoldOutlineDuo18,
  IconTextItalicOutlineDuo18,
  IconTextStrikethroughOutlineDuo18,
  IconTextUnderlineOutlineDuo18,
} from "nucleo-ui-outline-duo-18";

function BubbleToggle({
  pressed,
  onPressedChange,
  tooltip,
  shortcut,
  children,
}: {
  pressed: boolean;
  onPressedChange: () => void;
  tooltip: string;
  shortcut?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Toggle pressed={pressed} onPressedChange={onPressedChange} size="sm" />}
      >
        {children}
      </TooltipTrigger>
      <TooltipPopup side="bottom" sideOffset={8}>
        <span className="flex items-center gap-2">
          {tooltip}
          {shortcut && (
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {shortcut}
            </kbd>
          )}
        </span>
      </TooltipPopup>
    </Tooltip>
  );
}

type EditorBubbleMenuProps = {
  editor: Editor;
};

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }: { editor: Editor }) => ({
      isBold: e.isActive("bold"),
      isItalic: e.isActive("italic"),
      isUnderline: e.isActive("underline"),
      isStrike: e.isActive("strike"),
      isCode: e.isActive("code"),
      isHighlight: e.isActive("highlight"),
    }),
  });

  return (
    <BubbleMenu editor={editor}>
      <div className="editor-bubble-menu">
        <BubbleToggle
          pressed={state.isBold}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          tooltip="Bold"
          shortcut="Ctrl+B"
        >
          <IconTextBoldOutlineDuo18 />
        </BubbleToggle>
        <BubbleToggle
          pressed={state.isItalic}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          tooltip="Italic"
          shortcut="Ctrl+I"
        >
          <IconTextItalicOutlineDuo18 />
        </BubbleToggle>
        <BubbleToggle
          pressed={state.isUnderline}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          tooltip="Underline"
          shortcut="Ctrl+U"
        >
          <IconTextUnderlineOutlineDuo18 />
        </BubbleToggle>
        <BubbleToggle
          pressed={state.isStrike}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          tooltip="Strikethrough"
        >
          <IconTextStrikethroughOutlineDuo18 />
        </BubbleToggle>
        <BubbleToggle
          pressed={state.isCode}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          tooltip="Inline code"
          shortcut="Ctrl+E"
        >
          <IconCodeOutlineDuo18 />
        </BubbleToggle>
        <BubbleToggle
          pressed={state.isHighlight}
          onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
          tooltip="Highlight"
        >
          <IconHighlighterOutlineDuo18 />
        </BubbleToggle>
      </div>
    </BubbleMenu>
  );
}
