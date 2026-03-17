import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { Markdown } from "@tiptap/markdown";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useMemo } from "react";

import { EditorBubbleMenu } from "./editor-bubble-menu";
import { Callout } from "./extensions/callout-extension";
import { SlashCommand } from "./slash-command";
import "./editor.css";

const lowlight = createLowlight(common);

const initialContent = `# Welcome to the Editor

Start writing your documentation here. This editor supports a Notion-like experience with keyboard shortcuts and slash commands.

## Getting started

Type \`/\` on a new line to insert blocks like headings, lists, code blocks, and more. Select text to format it with the bubble menu.

## Formatting

You can use **bold**, *italic*, ~~strikethrough~~, \`inline code\`, and ==highlighted text==.

## Lists

- Bullet list item
- Another item

1. Ordered list item
2. Another item

## Code blocks

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Blockquotes

> This is a blockquote. It can contain **formatted text** and multiple paragraphs.

## Callouts

:::callout{type="info"}
This is an **info** callout. Use it to highlight important information.
:::

:::callout{type="warning"}
This is a **warning** callout. Use it to warn users about potential issues.
:::

:::callout{type="tip"}
This is a **tip** callout. Use it to share helpful advice.
:::

`;

export function Editor() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlockLowlight
      }),
      Markdown,
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
          }
          return 'Type "/" for commands...';
        },
        includeChildren: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Typography,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Callout,
      SlashCommand,
    ],
    content: initialContent,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: "prose-editor",
      },
    },
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  if (!editor) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="tiptap-editor flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[65ch] px-6 py-8 sm:px-8 sm:py-12">
            <EditorContent editor={editor} />
          </div>
        </div>
        <EditorBubbleMenu editor={editor} />
      </div>
    </EditorContext.Provider>
  );
}
