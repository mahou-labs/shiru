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
import { useCallback, useMemo, useState } from "react";

import { Button } from "@shiru/ui/button";
import { toStarlightMDX } from "./utils/mdx";

import { EditorBubbleMenu } from "./editor-bubble-menu";
import { Aside } from "./extensions/aside-extension";
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

## Asides

:::note
This is a **note** aside. Use it to highlight important information.
:::

:::tip
This is a **tip** aside. Use it to share helpful advice.
:::

:::caution
This is a **caution** aside. Use it to warn users about potential issues.
:::

:::danger
This is a **danger** aside. Use it for critical warnings.
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
      Aside,
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
  const [mdxOutput, setMdxOutput] = useState<string | null>(null);

  const handleExportMDX = useCallback(() => {
    if (!editor) return;
    const markdown = editor.getMarkdown();
    const mdx = toStarlightMDX(markdown, {
      title: "Test Page",
      description: "Generated from the editor",
    });
    setMdxOutput(mdx);
  }, [editor]);

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

        {/* Debug bar for testing MDX export */}
        <div className="flex items-center gap-2 border-t border-border bg-muted/50 px-4 py-2">
          <Button size="sm" variant="outline" onClick={handleExportMDX}>
            Export as MDX
          </Button>
          {mdxOutput && (
            <Button size="sm" variant="ghost" onClick={() => setMdxOutput(null)}>
              Close
            </Button>
          )}
        </div>

        {mdxOutput && (
          <div className="max-h-64 overflow-auto border-t border-border bg-muted p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">{mdxOutput}</pre>
          </div>
        )}
      </div>
    </EditorContext.Provider>
  );
}
