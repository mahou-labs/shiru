import { Alert, AlertDescription, AlertTitle } from "@shiru/ui/components/alert";
import { Button } from "@shiru/ui/components/button";
import { Separator } from "@shiru/ui/components/separator";
import { SidebarTrigger } from "@shiru/ui/components/sidebar";
import { Skeleton } from "@shiru/ui/components/skeleton";
import { Spinner } from "@shiru/ui/components/spinner";
import { Textarea } from "@shiru/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Placeholder } from "@tiptap/extensions";
import { Markdown, MarkdownManager } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import { useRef, useState, type ReactNode } from "react";

import { useAutosave, type SaveState } from "@/hooks/use-autosave";
import { canPublish, usePublish } from "@/hooks/use-publish";
import { errorMessage } from "@/lib/errors";
import { orpc } from "@/utils/orpc";

import type { FileStatus } from "../../../api/src/docs/drafts";
import { BlockHandle } from "./block-handle";
import { EditorBubbleMenu } from "./bubble-menu";
import { createMarked, markdownExtensions, parseBody, type Flavor } from "./markdown";
import { joinPage, readFields, splitPage, writeFields } from "./page";
import { settled } from "./settled";
import { slashMenu } from "./slash-menu";

import "./editor.css";

type PageEditorProps = {
  docId: string;
  path: string;
  flavor: Flavor;
  file?: FileStatus;
  autoFocus?: boolean;
  /** Opens the page list on small screens, where it is not shown beside the editor. */
  pagesButton?: ReactNode;
};

/** One page of a doc. Mount it keyed by path so nothing carries over between pages. */
export function PageEditor({ docId, path, flavor, file, autoFocus, pagesButton }: PageEditorProps) {
  const { data, error } = useQuery({
    ...orpc.docs.files.get.queryOptions({ input: { docId, path } }),
    meta: { silent: true },
  });

  if (!data) {
    return (
      <EditorFrame
        path={path}
        pagesButton={pagesButton}
        status={null}
        actions={<PublishButton docId={docId} />}
      >
        {error ? (
          <Alert variant="error">
            <AlertTitle>This page could not be opened</AlertTitle>
            <AlertDescription>
              <p>{errorMessage(error)}</p>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="mt-6 h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        )}
      </EditorFrame>
    );
  }
  return (
    <LoadedPage
      docId={docId}
      path={path}
      flavor={flavor}
      file={file}
      autoFocus={autoFocus}
      pagesButton={pagesButton}
      source={data.content}
    />
  );
}

function LoadedPage({
  docId,
  path,
  flavor,
  file,
  autoFocus,
  pagesButton,
  source,
}: PageEditorProps & { source: string }) {
  const queryClient = useQueryClient();
  const [page] = useState(() => splitPage(source));
  const [frontmatter, setFrontmatter] = useState(page.frontmatter);
  // Decided once, so fixing the YAML by hand does not swap the textarea out from under the cursor.
  const [raw] = useState(() => readFields(page.frontmatter) === null);
  const fields = readFields(frontmatter);
  // Until the body is edited it is saved as written, so a title change does not reformat it.
  const bodyEdited = useRef(false);

  const save = useMutation({
    ...orpc.docs.files.save.mutationOptions(),
    onSuccess: (status) => {
      const tree = orpc.docs.files.tree.queryKey({ input: { docId } });
      queryClient.setQueryData(tree, (old) => {
        if (!old) return old;
        const files: FileStatus[] = old.files;
        return { files: files.map((entry) => (entry.path === status.path ? status : entry)) };
      });
      void queryClient.invalidateQueries({
        queryKey: orpc.docs.status.queryKey({ input: { docId } }),
      });
    },
  });

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

  const autosave = useAutosave(
    () =>
      joinPage({
        frontmatter,
        body: bodyEdited.current && editor ? editor.getMarkdown() : page.body,
      }),
    (content: string) => {
      // The cached file is what this page reopens with, so it must follow the draft.
      queryClient.setQueryData(
        orpc.docs.files.get.queryKey({ input: { docId, path } }),
        (old) => old && { ...old, content },
      );
      return save.mutateAsync({ docId, path, content });
    },
  );

  function changeFrontmatter(next: string | null) {
    setFrontmatter(next);
    autosave.edit();
  }

  return (
    <EditorFrame
      path={path}
      pagesButton={pagesButton}
      status={<SaveStatus state={autosave.state} onRetry={() => void autosave.flush()} />}
      actions={
        <PublishButton
          docId={docId}
          edited={autosave.state.kind !== "idle" && autosave.state.kind !== "saved"}
          beforePublish={autosave.flush}
        />
      }
    >
      {file?.conflict && (
        <Alert variant="warning" className="mb-8">
          <AlertTitle>This page changed outside the editor</AlertTitle>
          <AlertDescription>
            <p>
              Someone pushed a new version after you edited it. Your draft is kept, but it will not
              be published.
            </p>
          </AlertDescription>
        </Alert>
      )}
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
    </EditorFrame>
  );
}

function EditorFrame({
  path,
  pagesButton,
  status,
  actions,
  children,
}: {
  path: string;
  pagesButton?: ReactNode;
  status: ReactNode;
  actions: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        {/* The page list links back to the dashboard, so on small screens it takes the app sidebar's place. */}
        {pagesButton && <div className="-ms-1 md:hidden">{pagesButton}</div>}
        <SidebarTrigger className={pagesButton ? "-ms-1 max-md:hidden" : "-ms-1"} />
        <Separator orientation="vertical" className="me-1 h-4" />
        <span className="truncate font-mono text-muted-foreground text-xs" title={path}>
          {path}
        </span>
        <div className="ms-auto flex shrink-0 items-center gap-3">
          {status}
          {actions}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">{children}</div>
      </div>
    </div>
  );
}

function SaveStatus({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  const text = "text-muted-foreground text-xs";
  switch (state.kind) {
    case "idle":
      return null;
    case "dirty":
      return <span className={text}>Unsaved changes</span>;
    case "saving":
      return (
        <span className={`${text} inline-flex items-center gap-1.5`}>
          <Spinner className="size-3" />
          Saving…
        </span>
      );
    case "saved":
      return <span className={text}>Draft saved</span>;
    case "error":
      return (
        <span className="inline-flex items-center gap-2 text-destructive-foreground text-xs">
          Not saved
          <Button size="xs" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </span>
      );
  }
}

/**
 * Publishes after the doc's pending edits are saved, which the doc status cannot know of yet: the
 * open page's, and those other pages still have in flight or flushed as they unmounted.
 */
function PublishButton({
  docId,
  edited = false,
  beforePublish = () => Promise.resolve(),
}: {
  docId: string;
  edited?: boolean;
  beforePublish?: () => Promise<unknown>;
}) {
  const queryClient = useQueryClient();
  const { state, publish } = usePublish(docId);
  const [flushing, setFlushing] = useState(false);

  async function onPublish() {
    setFlushing(true);
    try {
      await beforePublish();
      await settled(queryClient.getMutationCache(), {
        mutationKey: orpc.docs.files.save.mutationKey(),
        predicate: (mutation) =>
          (mutation.state.variables as { docId?: string } | undefined)?.docId === docId,
      });
    } catch {
      // The failed save already explains itself, and publishing now would skip the edit.
      return;
    } finally {
      setFlushing(false);
    }
    publish.mutate({ docId });
  }

  return (
    <Button
      size="sm"
      loading={flushing || publish.isPending}
      disabled={!state || state.kind === "building" || (!edited && !canPublish(state))}
      onClick={() => void onPublish()}
    >
      {state?.kind === "building" ? "Publishing…" : "Publish"}
    </Button>
  );
}
