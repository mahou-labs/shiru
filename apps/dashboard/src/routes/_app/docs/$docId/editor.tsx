import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shiru/ui/components/empty";
import { Button } from "@shiru/ui/components/button";
import { Skeleton } from "@shiru/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  IconArrowLeftOutlineDuo18,
  IconFileOutlineDuo18,
  IconPlusOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useState } from "react";
import { flushSync } from "react-dom";
import { z } from "zod";

import { flavorOf } from "@/editor/markdown";
import { DeletePageDialog, NewPageDialog, useDeletePage } from "@/editor/page-actions";
import { PageEditor } from "@/editor/page-editor";
import { PageTree } from "@/editor/page-tree";
import { HOME, PAGES_ROOT } from "@/editor/pages";
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
  const pages = files?.filter((file) => file.status !== "deleted" && flavorOf(file.path) !== null);
  const current = path ?? (pages?.find((file) => file.path === HOME) ?? pages?.[0])?.path;
  const flavor = current ? flavorOf(current) : null;

  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<FileStatus | null>(null);
  // The page being deleted, kept out of the editor until the delete settles.
  const [closing, setClosing] = useState<string>();
  const [focusBody, setFocusBody] = useState<string>();

  const remove = useDeletePage(docId, (deleted) => {
    if (deleted !== current) return;
    // Synchronous, so the editor's unmount flush is already queued when the delete waits on saves.
    flushSync(() => setClosing(deleted));
    void navigate({ search: {} });
  });

  return (
    <div className="flex h-svh min-h-0 md:h-[calc(100svh-1rem)]">
      <aside className="hidden w-64 shrink-0 flex-col border-e md:flex">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
          <Link
            to="/"
            aria-label="Back to dashboard"
            className="-ms-1 flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconArrowLeftOutlineDuo18 className="size-4" />
          </Link>
          <span className="truncate font-medium text-sm">{doc?.name ?? "Pages"}</span>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="New page"
            title="New page"
            className="ms-auto"
            disabled={!files}
            onClick={() => setCreatingIn(PAGES_ROOT)}
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
              onCreate={setCreatingIn}
              onDelete={setConfirming}
            />
          ) : (
            <div className="flex flex-col gap-2 p-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          )}
        </div>
      </aside>
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
        <PageEditor
          key={current}
          docId={docId}
          path={current}
          flavor={flavor}
          file={pages?.find((file) => file.path === current)}
          autoFocus={focusBody === current}
        />
      ) : (
        pages &&
        current !== closing && (
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
                    : "Push a content/index.mdx file to this site to start editing."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )
      )}
    </div>
  );
}
