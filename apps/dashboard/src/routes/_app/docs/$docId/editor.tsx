import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shiru/ui/components/empty";
import { Button } from "@shiru/ui/components/button";
import { Sheet, SheetPopup } from "@shiru/ui/components/sheet";
import { Skeleton } from "@shiru/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useFeatureFlagEnabled } from "@posthog/react";
import {
  IconArrowLeftOutlineDuo18,
  IconFileOutlineDuo18,
  IconFilesOutlineDuo18,
  IconPlusOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useState } from "react";
import { flushSync } from "react-dom";
import { z } from "zod";

import { DeletePageDialog, NewPageDialog, useDeletePage } from "@/components/editor/page-actions";
import { PageTree } from "@/components/editor/page-tree";
import { flavorOf, HOME, PAGES_ROOT } from "@/components/editor/pages";
import { PageEditor as PageEditorV1 } from "@/components/editor-v1/page-editor";
import { PageEditor as PageEditorV2 } from "@/components/editor-v2/page-editor";
import { orpc } from "@/utils/orpc";

import type { FileStatus } from "../../../../../../api/src/docs/drafts";

export const Route = createFileRoute("/_app/docs/$docId/editor")({
  validateSearch: z.object({
    path: z.string().optional().catch(undefined),
  }),
  component: Editor,
});

function Editor() {
  const { docId } = Route.useParams();
  const { path } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: docs } = useQuery(orpc.docs.list.queryOptions());
  const { data: tree } = useQuery(orpc.docs.files.tree.queryOptions({ input: { docId } }));
  const doc = docs?.find((entry) => entry.id === docId);
  const files: FileStatus[] | undefined = tree?.files;
  // A doc's repo holds the whole site project, so only Markdown under PAGES_ROOT is a page.
  const pages = files?.filter(
    (file) =>
      file.status !== "deleted" && file.path.startsWith(PAGES_ROOT) && flavorOf(file.path) !== null,
  );
  const current = path ?? (pages?.find((file) => file.path === HOME) ?? pages?.[0])?.path;
  const flavor = current ? flavorOf(current) : null;
  // PostHog is off in development, where the flag reads undefined and the env var decides.
  const editorV2 = useFeatureFlagEnabled("editor-v2") ?? import.meta.env.VITE_EDITOR_V2 === "true";

  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<FileStatus | null>(null);
  // The page being deleted, kept out of the editor until the delete settles.
  const [closing, setClosing] = useState<string>();
  const [focusBody, setFocusBody] = useState<string>();
  const [pagesOpen, setPagesOpen] = useState(false);
  const pagesButton = (
    <Button
      size="icon"
      variant="ghost"
      className="size-7"
      aria-label="Pages"
      onClick={() => setPagesOpen(true)}
    >
      <IconFilesOutlineDuo18 />
    </Button>
  );

  const remove = useDeletePage(docId, (deleted) => {
    if (deleted !== current) return;
    // Synchronous, so the editor's unmount flush is already queued when the delete waits on saves.
    flushSync(() => setClosing(deleted));
    void navigate({ search: {} });
  });

  return (
    <div className="flex h-svh min-h-0 md:h-[calc(100svh-1rem)]">
      <aside className="hidden w-64 shrink-0 flex-col border-e md:flex">
        <PagesPanel
          docId={docId}
          name={doc?.name}
          files={files}
          pages={pages}
          current={current}
          onCreate={setCreatingIn}
          onDelete={setConfirming}
        />
      </aside>
      {/* Small screens have no room beside the editor, so the same panel opens over it. */}
      <Sheet open={pagesOpen} onOpenChange={setPagesOpen}>
        <SheetPopup
          side="left"
          showCloseButton={false}
          aria-label="Pages"
          className="max-w-72 md:hidden"
        >
          <PagesPanel
            docId={docId}
            name={doc?.name}
            files={files}
            pages={pages}
            current={current}
            onCreate={(folder) => {
              setPagesOpen(false);
              setCreatingIn(folder);
            }}
            onDelete={(file) => {
              setPagesOpen(false);
              setConfirming(file);
            }}
            onNavigate={() => setPagesOpen(false)}
          />
        </SheetPopup>
      </Sheet>
      {files && (
        <NewPageDialog
          docId={docId}
          files={files}
          folder={creatingIn}
          onClose={() => setCreatingIn(null)}
          onCreated={(created) => {
            setCreatingIn(null);
            setFocusBody(created);
            void navigate({ search: { path: created } });
          }}
        />
      )}
      <DeletePageDialog
        file={confirming}
        onClose={() => setConfirming(null)}
        onConfirm={(deleted) => {
          setConfirming(null);
          remove.mutate(deleted, { onSettled: () => setClosing(undefined) });
        }}
      />
      {current && flavor && current !== closing ? (
        editorV2 ? (
          <PageEditorV2
            key={current}
            docId={docId}
            path={current}
            flavor={flavor}
            file={pages?.find((file) => file.path === current)}
            autoFocus={focusBody === current}
            pagesButton={pagesButton}
          />
        ) : (
          <PageEditorV1
            key={current}
            docId={docId}
            path={current}
            file={pages?.find((file) => file.path === current)}
            autoFocus={focusBody === current}
            pagesButton={pagesButton}
          />
        )
      ) : (
        pages &&
        current !== closing && (
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-12 shrink-0 items-center border-b px-4 md:hidden">
              <div className="-ms-1">{pagesButton}</div>
            </header>
            <div className="flex flex-1 items-center justify-center p-6">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconFileOutlineDuo18 />
                  </EmptyMedia>
                  <EmptyTitle>{current ? "This file is not a page" : "No pages yet"}</EmptyTitle>
                  <EmptyDescription>
                    {current
                      ? "Only .md and .mdx files open in the editor."
                      : "Push a src/content/docs/index.mdx file to this site to start editing."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          </div>
        )
      )}
    </div>
  );
}

/** The doc's pages with controls to create and delete them, beside the editor or over it. */
function PagesPanel({
  docId,
  name,
  files,
  pages,
  current,
  onCreate,
  onDelete,
  onNavigate,
}: {
  docId: string;
  name: string | undefined;
  files: FileStatus[] | undefined;
  pages: FileStatus[] | undefined;
  current: string | undefined;
  onCreate: (folder: string) => void;
  onDelete: (file: FileStatus) => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <Link
          to="/"
          aria-label="Back to dashboard"
          className="-ms-1 flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconArrowLeftOutlineDuo18 className="size-4" />
        </Link>
        <span className="truncate font-medium text-sm">{name ?? "Pages"}</span>
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="New page"
          title="New page"
          className="ms-auto"
          disabled={!files}
          onClick={() => onCreate(PAGES_ROOT)}
        >
          <IconPlusOutlineDuo18 />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {pages ? (
          <PageTree
            docId={docId}
            files={pages}
            current={current}
            onCreate={onCreate}
            onDelete={onDelete}
            onNavigate={onNavigate}
          />
        ) : (
          <div className="flex flex-col gap-2 p-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        )}
      </div>
    </div>
  );
}
