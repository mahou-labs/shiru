import { Textarea } from "@shiru/ui/components/textarea";
import { Placeholder } from "@tiptap/extensions";
import { Markdown, MarkdownManager } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import { useRef, useState } from "react";

import {
  LoadPage,
  PageFrame,
  usePageAutosave,
  type PageEditorProps,
} from "@/components/editor/page-frame";
import type { Flavor } from "@/components/editor/pages";

import { BlockHandle } from "./block-handle";
import { EditorBubbleMenu } from "./bubble-menu";
import { createMarked, markdownExtensions, parseBody } from "./markdown";
import { joinPage, readFields, splitPage, writeFields } from "./page";
import { slashMenu } from "./slash-menu";

import "./editor.css";

/** One page of a doc. Mount it keyed by path so nothing carries over between pages. */
export function PageEditor(props: PageEditorProps & { flavor: Flavor }) {
  return <LoadPage {...props}>{(source) => <LoadedPage {...props} source={source} />}</LoadPage>;
}

function LoadedPage({
  docId,
  path,
  flavor,
  file,
  autoFocus,
  pagesButton,
  source,
}: PageEditorProps & { flavor: Flavor; source: string }) {
  const [page] = useState(() => splitPage(source));
  const [frontmatter, setFrontmatter] = useState(page.frontmatter);
  // Decided once, so fixing the YAML by hand does not swap the textarea out from under the cursor.
  const [raw] = useState(() => readFields(page.frontmatter) === null);
  const fields = readFields(frontmatter);
  // Until the body is edited it is saved as written, so a title change does not reformat it.
  const bodyEdited = useRef(false);

  const [content] = useState(() =>
    parseBody(
      new MarkdownManager({ marked: createMarked(), extensions: markdownExtensions(flavor) }),
      page.body,
    ),
  );

  const editor = useEditor({
    autofocus: autoFocus ? "start" : false,
    extensions: [
      ...markdownExtensions(flavor),
      Markdown.configure({ marked: createMarked() }),
      slashMenu(flavor),
      Placeholder.configure({
        includeChildren: true,
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return `Heading ${node.attrs.level}`;
          return node.type.name === "paragraph" ? "Type / for commands" : "";
        },
      }),
    ],
    content,
    shouldRerenderOnTransaction: false,
    // `docs-content` gives the body the published site's styles, from `editor.css`.
    editorProps: {
      attributes: { class: "docs-content min-h-64 outline-none", "aria-label": "Page content" },
    },
    // Only edits after initialization count: content set while the editor is created is the
    // loaded page, and saving it would rewrite the file without anyone touching it.
    onUpdate: ({ editor, transaction }) => {
      if (!transaction.docChanged || !editor.isInitialized) return;
      bodyEdited.current = true;
      autosave.edit();
    },
  });

  const autosave = usePageAutosave(docId, path, () =>
    joinPage({
      frontmatter,
      body: bodyEdited.current && editor ? editor.getMarkdown() : page.body,
    }),
  );

  function changeFrontmatter(next: string | null) {
    setFrontmatter(next);
    autosave.edit();
  }

  return (
    <PageFrame docId={docId} path={path} file={file} pagesButton={pagesButton} autosave={autosave}>
      {raw || !fields ? (
        <div className="mb-8 flex flex-col gap-2">
          <label htmlFor="frontmatter" className="font-medium text-sm">
            Frontmatter
          </label>
          <p className="text-muted-foreground text-sm">
            This frontmatter is not YAML the title and description fields can edit, so it is shown
            as written.
          </p>
          <Textarea
            id="frontmatter"
            className="font-mono"
            value={frontmatter ?? ""}
            spellCheck={false}
            onChange={(event) => changeFrontmatter(event.target.value || null)}
          />
        </div>
      ) : (
        <header className="mb-8 flex flex-col gap-3 border-b pb-8">
          <input
            aria-label="Title"
            placeholder="Untitled"
            value={fields.title}
            className="w-full bg-transparent font-heading font-semibold text-4xl tracking-tight outline-none placeholder:text-muted-foreground/60"
            onChange={(event) =>
              changeFrontmatter(writeFields(frontmatter, { title: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              editor?.commands.focus("start");
            }}
          />
          <textarea
            aria-label="Description"
            placeholder="Add a description"
            rows={1}
            value={fields.description}
            className="field-sizing-content w-full resize-none bg-transparent text-lg text-muted-foreground leading-relaxed outline-none placeholder:text-muted-foreground/60"
            onChange={(event) =>
              changeFrontmatter(writeFields(frontmatter, { description: event.target.value }))
            }
          />
        </header>
      )}
      {editor && (
        <>
          <BlockHandle editor={editor}>
            <EditorContent editor={editor} />
          </BlockHandle>
          <EditorBubbleMenu editor={editor} />
        </>
      )}
    </PageFrame>
  );
}
