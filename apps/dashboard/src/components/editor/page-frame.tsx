import { Alert, AlertDescription, AlertTitle } from "@shiru/ui/components/alert";
import { Button } from "@shiru/ui/components/button";
import { Separator } from "@shiru/ui/components/separator";
import { SidebarTrigger } from "@shiru/ui/components/sidebar";
import { Skeleton } from "@shiru/ui/components/skeleton";
import { Spinner } from "@shiru/ui/components/spinner";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@shiru/ui/components/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconArrowUpRightOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { useState, type ReactNode } from "react";

import { useAutosave, type SaveState } from "@/hooks/use-autosave";
import { usePreview } from "@/hooks/use-preview";
import { canPublish, usePublish } from "@/hooks/use-publish";
import { buildErrorSummary } from "@/lib/build-error";
import { errorMessage } from "@/lib/errors";
import { orpc } from "@/utils/orpc";

import type { FileStatus } from "../../../../api/src/docs/drafts";
import { settled } from "./settled";

export type PageEditorProps = {
  docId: string;
  path: string;
  file?: FileStatus;
  autoFocus?: boolean;
  /** Opens the page list on small screens, where it is not shown beside the editor. */
  pagesButton?: ReactNode;
};

/** Fetches a page's source and renders `children` with it once it arrives. */
export function LoadPage({
  docId,
  path,
  pagesButton,
  children,
}: PageEditorProps & { children: (source: string) => ReactNode }) {
  const { data, error } = useQuery({
    ...orpc.docs.files.get.queryOptions({ input: { docId, path } }),
    meta: { silent: true },
  });

  if (data) return children(data.content);
  return (
    <EditorFrame
      path={path}
      pagesButton={pagesButton}
      status={null}
      actions={<DocActions docId={docId} />}
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

/** Saves the page source `read` returns, a moment after each `edit()`. */
export function usePageAutosave(docId: string, path: string, read: () => string) {
  const queryClient = useQueryClient();
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

  return useAutosave(read, (content: string) => {
    // The cached file is what this page reopens with, so it must follow the draft.
    queryClient.setQueryData(
      orpc.docs.files.get.queryKey({ input: { docId, path } }),
      (old) => old && { ...old, content },
    );
    return save.mutateAsync({ docId, path, content });
  });
}

/** A loaded page: its save status, the preview and publish buttons, and a warning when it is in conflict. */
export function PageFrame({
  docId,
  path,
  file,
  pagesButton,
  autosave,
  children,
}: PageEditorProps & {
  autosave: ReturnType<typeof usePageAutosave>;
  children: ReactNode;
}) {
  return (
    <EditorFrame
      path={path}
      pagesButton={pagesButton}
      status={<SaveStatus state={autosave.state} onRetry={() => void autosave.flush()} />}
      actions={
        <DocActions
          docId={docId}
          edited={autosave.state.kind !== "idle" && autosave.state.kind !== "saved"}
          flushPage={autosave.flush}
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
      {children}
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

/** The toolbar's preview and publish controls. */
function DocActions(props: {
  docId: string;
  edited?: boolean;
  flushPage?: () => Promise<unknown>;
}) {
  return (
    <>
      <PreviewButton {...props} />
      <PublishButton {...props} />
    </>
  );
}

/**
 * Saves the doc's pending edits, which the doc status cannot know of yet: the open page's, and
 * those other pages still have in flight or flushed as they unmounted. Resolves false when a save
 * failed, which already explains itself, so building now would skip the edit.
 */
function useFlushEdits(docId: string, flushPage: () => Promise<unknown>) {
  const queryClient = useQueryClient();
  const [flushing, setFlushing] = useState(false);

  async function flush() {
    setFlushing(true);
    try {
      await flushPage();
      await settled(queryClient.getMutationCache(), {
        mutationKey: orpc.docs.files.save.mutationKey(),
        predicate: (mutation) =>
          (mutation.state.variables as { docId?: string } | undefined)?.docId === docId,
      });
      return true;
    } catch {
      return false;
    } finally {
      setFlushing(false);
    }
  }

  return { flushing, flush };
}

/** Builds the drafts as they are now on the draft target, once pending edits are saved. */
function PreviewButton({
  docId,
  flushPage = () => Promise.resolve(),
}: {
  docId: string;
  flushPage?: () => Promise<unknown>;
}) {
  const { state, empty, url, preview } = usePreview(docId);
  const { flushing, flush } = useFlushEdits(docId, flushPage);

  async function onPreview() {
    if (await flush()) preview.mutate({ docId });
  }

  const deployed = state && state.kind !== "none" ? state.deployed : null;
  return (
    <>
      {state?.kind === "failed" && (
        <Tooltip>
          <TooltipTrigger
            render={<span className="cursor-default text-destructive-foreground text-xs" />}
          >
            Preview failed
          </TooltipTrigger>
          <TooltipPopup side="bottom" className="max-w-sm">
            {buildErrorSummary(state.error)}
          </TooltipPopup>
        </Tooltip>
      )}
      {deployed && url && (
        <Button size="sm" variant="ghost" render={<a href={url} target="_blank" rel="noopener" />}>
          <span className="max-sm:sr-only">Open preview</span>
          <IconArrowUpRightOutlineDuo18 />
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        loading={flushing || preview.isPending}
        disabled={!state || state.kind === "building" || empty}
        onClick={() => void onPreview()}
      >
        {state?.kind === "building" ? "Building preview…" : "Preview"}
      </Button>
    </>
  );
}

/** Publishes once the doc's pending edits are saved. */
function PublishButton({
  docId,
  edited = false,
  flushPage = () => Promise.resolve(),
}: {
  docId: string;
  edited?: boolean;
  flushPage?: () => Promise<unknown>;
}) {
  const { state, publish } = usePublish(docId);
  const { flushing, flush } = useFlushEdits(docId, flushPage);

  async function onPublish() {
    if (await flush()) publish.mutate({ docId });
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
