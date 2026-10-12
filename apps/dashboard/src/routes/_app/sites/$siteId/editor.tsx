import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shiru/ui/components/empty";
import { Skeleton } from "@shiru/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { IconArrowLeftOutlineDuo18, IconFileOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { z } from "zod";

import { flavorOf } from "@/editor/markdown";
import { PageEditor } from "@/editor/page-editor";
import { PageTree } from "@/editor/page-tree";
import { orpc } from "@/utils/orpc";

import type { FileStatus } from "../../../../../../api/src/sites/drafts";

export const Route = createFileRoute("/_app/sites/$siteId/editor")({
  validateSearch: z.object({
    path: z.string().optional().catch(undefined),
  }),
  component: Editor,
});

const HOME = "content/index.mdx";

function Editor() {
  const { siteId } = Route.useParams();
  const { path } = Route.useSearch();
  const { data: sites } = useQuery(orpc.sites.list.queryOptions());
  const { data: tree } = useQuery(orpc.sites.files.tree.queryOptions({ input: { siteId } }));
  const site = sites?.find((entry) => entry.id === siteId);
  const files: FileStatus[] | undefined = tree?.files;
  const pages = files?.filter((file) => file.status !== "deleted" && flavorOf(file.path) !== null);
  const current = path ?? (pages?.find((file) => file.path === HOME) ?? pages?.[0])?.path;
  const flavor = current ? flavorOf(current) : null;

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
          <span className="truncate font-medium text-sm">{site?.name ?? "Pages"}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {pages ? (
            <PageTree siteId={siteId} files={pages} current={current} />
          ) : (
            <div className="flex flex-col gap-2 p-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          )}
        </div>
      </aside>
      {current && flavor ? (
        <PageEditor
          key={current}
          siteId={siteId}
          path={current}
          flavor={flavor}
          file={pages?.find((file) => file.path === current)}
        />
      ) : (
        pages && (
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
