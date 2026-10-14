import { EditorContent, useEditor } from "@tiptap/react";
import { useState } from "react";

import {
  LoadPage,
  PageFrame,
  usePageAutosave,
  type PageEditorProps,
} from "@/components/editor/page-frame";

import { sourceDoc, sourceExtensions } from "./source";

/** One page of a doc, edited as its raw source. Mount it keyed by path. */
export function PageEditor(props: PageEditorProps) {
  return <LoadPage {...props}>{(source) => <LoadedPage {...props} source={source} />}</LoadPage>;
}

function LoadedPage({
  docId,
  path,
  file,
  autoFocus,
  pagesButton,
  source,
}: PageEditorProps & { source: string }) {
  const [content] = useState(() => sourceDoc(source));

  const editor = useEditor({
    autofocus: autoFocus ? "end" : false,
    extensions: sourceExtensions,
    content,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "min-h-64 outline-none",
        "aria-label": "Page source",
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor, transaction }) => {
      if (!transaction.docChanged || !editor.isInitialized) return;
      autosave.edit();
    },
  });

  const autosave = usePageAutosave(docId, path, () => editor?.getText() ?? source);

  return (
    <PageFrame docId={docId} path={path} file={file} pagesButton={pagesButton} autosave={autosave}>
      {editor && <EditorContent editor={editor} />}
    </PageFrame>
  );
}
