import { Alert, AlertTitle } from "@shiru/ui/components/alert";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@shiru/ui/components/alert-dialog";
import { Button } from "@shiru/ui/components/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@shiru/ui/components/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/components/field";
import { Form } from "@shiru/ui/components/form";
import { Input } from "@shiru/ui/components/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { errorMessage } from "@/lib/errors";
import { orpc } from "@/utils/orpc";

import type { FileStatus, SitePath } from "../../../api/src/sites/drafts";
import { newPagePathError, newPageSource, routeOf, suggestPath, withFile } from "./pages";
import { settled } from "./settled";

/** Asks for a title and a path in `folder`, then creates the page as a draft. */
export function NewPageDialog({
  siteId,
  files,
  folder,
  onClose,
  onCreated,
}: {
  siteId: string;
  files: FileStatus[];
  /** The folder the page goes in, ending in `/`; null keeps the dialog closed. */
  folder: string | null;
  onClose: () => void;
  onCreated: (path: string) => void;
}) {
  return (
    <Dialog open={folder !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New page</DialogTitle>
        </DialogHeader>
        {folder !== null && (
          <NewPageForm siteId={siteId} files={files} folder={folder} onCreated={onCreated} />
        )}
      </DialogPopup>
    </Dialog>
  );
}

function NewPageForm({
  siteId,
  files,
  folder,
  onCreated,
}: {
  siteId: string;
  files: FileStatus[];
  folder: string;
  onCreated: (path: string) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [pathInput, setPathInput] = useState<string>();
  const path = pathInput ?? suggestPath(folder, title);
  const pathError = path ? newPagePathError(path, files) : undefined;

  const create = useMutation({
    ...orpc.sites.files.save.mutationOptions(),
    meta: { silent: true },
    onSuccess: (status, { path, content }) => {
      queryClient.setQueryData(
        orpc.sites.files.tree.queryKey({ input: { siteId } }),
        (old) => old && { files: withFile(old.files, status) },
      );
      // The editor opens with what was just written instead of waiting on a fetch.
      queryClient.setQueryData(orpc.sites.files.get.queryKey({ input: { siteId, path } }), {
        path: path as SitePath,
        content,
      });
      void queryClient.invalidateQueries({
        queryKey: orpc.sites.status.queryKey({ input: { siteId } }),
      });
      onCreated(path);
    },
  });

  return (
    <Form
      onFormSubmit={() => create.mutate({ siteId, path, content: newPageSource(title.trim()) })}
    >
      <DialogPanel className="flex flex-col gap-4">
        {create.error && (
          <Alert variant="error">
            <AlertTitle>{errorMessage(create.error)}</AlertTitle>
          </Alert>
        )}
        <Field name="title">
          <FieldLabel>Title</FieldLabel>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Getting started"
            autoFocus
            required
          />
        </Field>
        <Field name="path" invalid={pathError ? true : undefined}>
          <FieldLabel>Path</FieldLabel>
          <Input
            value={path}
            onChange={(event) => setPathInput(event.target.value)}
            placeholder={`${folder}getting-started.mdx`}
            className="font-mono"
            spellCheck={false}
            required
          />
          {pathError ? (
            <FieldError match>{pathError}.</FieldError>
          ) : (
            <FieldDescription>
              {path ? `Served at ${routeOf(path)}` : "Pages live in content/ as .mdx or .md files."}
            </FieldDescription>
          )}
        </Field>
      </DialogPanel>
      <DialogFooter>
        <Button
          type="submit"
          loading={create.isPending}
          disabled={!title.trim() || !path || pathError !== undefined}
        >
          Create page
        </Button>
      </DialogFooter>
    </Form>
  );
}

/**
 * Deletes a page once every save of it has landed, so a save still in flight, or the one the
 * editor flushes as it unmounts, cannot write the page back after the delete. `leave` must unmount
 * the page's editor synchronously when it is open.
 */
export function useDeletePage(siteId: string, leave: (path: string) => void) {
  const queryClient = useQueryClient();
  const tree = orpc.sites.files.tree.queryKey({ input: { siteId } });

  return useMutation({
    // Dropped rather than marked deleted, so a save landing first cannot map it back into view.
    onMutate: async (path) => {
      leave(path);
      await queryClient.cancelQueries({ queryKey: tree });
      queryClient.setQueryData(
        tree,
        (old) => old && { files: old.files.filter((file: FileStatus) => file.path !== path) },
      );
    },
    mutationFn: async (path: string) => {
      await settled(queryClient.getMutationCache(), {
        mutationKey: orpc.sites.files.save.mutationKey(),
        predicate: (mutation) => {
          const input = mutation.state.variables as { siteId?: string; path?: string } | undefined;
          return input?.siteId === siteId && input.path === path;
        },
      });
      return orpc.sites.files.delete.call({ siteId, path });
    },
    onSuccess: (_result, path) => {
      queryClient.removeQueries({
        queryKey: orpc.sites.files.get.queryKey({ input: { siteId, path } }),
      });
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: tree }),
        queryClient.invalidateQueries({
          queryKey: orpc.sites.status.queryKey({ input: { siteId } }),
        }),
      ]),
  });
}

/** Confirms deleting `file`, naming it and saying whether the live site keeps it until publish. */
export function DeletePageDialog({
  file,
  onClose,
  onConfirm,
}: {
  file: FileStatus | null;
  onClose: () => void;
  onConfirm: (path: string) => void;
}) {
  const [shown, setShown] = useState(file);
  if (file && file !== shown) setShown(file);
  const name = shown?.path.replace(/^content\//, "").replace(/\.mdx?$/, "");

  return (
    <AlertDialog open={file !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {shown?.status === "added"
              ? "This page was never published, so it is gone for good."
              : `${routeOf(shown?.path ?? "")} stays on the live site until you publish.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
          <Button variant="destructive" onClick={() => shown && onConfirm(shown.path)}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
