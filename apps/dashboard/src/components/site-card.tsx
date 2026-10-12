import { isDefinedError, type InferClientErrors, type InferClientOutputs } from "@orpc/client";
import { Alert, AlertDescription, AlertTitle } from "@shiru/ui/components/alert";
import { Badge } from "@shiru/ui/components/badge";
import { Button } from "@shiru/ui/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@shiru/ui/components/card";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@shiru/ui/components/collapsible";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  IconArrowUpRightOutlineDuo18,
  IconChevronDownOutlineDuo18,
} from "nucleo-ui-outline-duo-18";

import { errorMessage } from "@/lib/errors";
import { orpc } from "@/utils/orpc";

import type { AppRouterClient } from "../../../api/src/routers";
import { LIVE } from "../../../api/src/sites/names";
import type { SiteStatus } from "../../../api/src/sites/site-do";

type Outputs = InferClientOutputs<AppRouterClient>["sites"];
type Site = Outputs["list"][number];
type PublishError = InferClientErrors<AppRouterClient>["sites"]["publish"];

const POLL_MS = 2000;

/** What the live site serves, plus the draft files a publish would commit. */
export type PublishState = { changes: number; conflicts: number } & (
  | { kind: "unpublished" }
  | { kind: "building"; live: string | null }
  | { kind: "live"; sha: string; atHead: boolean }
  | { kind: "failed"; error: string; live: string | null }
);

export function publishState(status: SiteStatus): PublishState {
  const conflicts = status.drafts.filter((draft) => draft.conflict).length;
  const counts = { changes: status.drafts.length - conflicts, conflicts };
  const target = status.targets[LIVE];
  const live = target?.deployed?.sha ?? null;
  switch (target?.kind) {
    case "building":
      return { ...counts, kind: "building", live };
    case "failed":
      return { ...counts, kind: "failed", error: target.error, live };
    default:
      return live
        ? { ...counts, kind: "live", sha: live, atHead: live === status.headSha }
        : { ...counts, kind: "unpublished" };
  }
}

/** Whether a publish would commit or build anything. A failed build can always be retried. */
function canPublish(state: PublishState) {
  if (state.kind === "building") return false;
  if (state.kind === "live") return state.changes > 0 || !state.atHead;
  return state.kind === "failed" || state.changes > 0;
}

const shortSha = (sha: string) => sha.slice(0, 7);
const files = (count: number) => (count === 1 ? "1 file" : `${count} files`);

export function SiteCard({ site }: { site: Site }) {
  const queryClient = useQueryClient();
  const statusOptions = orpc.sites.status.queryOptions({ input: { siteId: site.id } });
  const { data: status } = useQuery({
    ...statusOptions,
    refetchInterval: (query) =>
      query.state.data?.targets[LIVE]?.kind === "building" ? POLL_MS : false,
  });
  const publish = useMutation({
    ...orpc.sites.publish.mutationOptions(),
    meta: { silent: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: statusOptions.queryKey }),
  });

  const state = status && publishState(status);
  const live = state && (state.kind === "live" ? state.sha : "live" in state ? state.live : null);
  const host = new URL(site.url).host;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{site.name}</CardTitle>
        <CardDescription>
          {live ? (
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
            >
              {host}
              <IconArrowUpRightOutlineDuo18 className="size-3.5" />
            </a>
          ) : (
            host
          )}
        </CardDescription>
        {state && (
          <CardAction>
            <StateBadge state={state} />
          </CardAction>
        )}
      </CardHeader>
      {state && (
        <CardPanel className="flex flex-col gap-3 text-sm">
          <StatusLine state={state} />
          {state.kind === "failed" && <BuildError error={state.error} />}
          {publish.error && <PublishErrorAlert error={publish.error} />}
          {publish.data && publish.data.skipped.length > 0 && (
            <Alert variant="warning">
              <AlertTitle>{files(publish.data.skipped.length)} not published</AlertTitle>
              <AlertDescription>
                <p>
                  {publish.data.skipped.join(", ")} changed outside the editor since you edited
                  them. Their drafts are kept.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardPanel>
      )}
      {state && (
        <CardFooter className="gap-2">
          <Button
            loading={publish.isPending}
            disabled={!canPublish(state)}
            onClick={() => publish.mutate({ siteId: site.id })}
          >
            {state.kind === "building" ? "Publishing…" : "Publish"}
          </Button>
          {live && (
            <Button
              variant="outline"
              render={<a href={site.url} target="_blank" rel="noreferrer" />}
            >
              Open site
              <IconArrowUpRightOutlineDuo18 />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

function StateBadge({ state }: { state: PublishState }) {
  switch (state.kind) {
    case "unpublished":
      return <Badge variant="outline">Not published yet</Badge>;
    case "building":
      return <Badge variant="info">Building</Badge>;
    case "live":
      return <Badge variant="success">Live</Badge>;
    case "failed":
      return <Badge variant="error">Build failed</Badge>;
  }
}

function StatusLine({ state }: { state: PublishState }) {
  const pending =
    state.changes > 0
      ? ` ${files(state.changes)} ready to publish.`
      : state.kind === "unpublished"
        ? " There is nothing to publish yet."
        : state.kind === "live" && state.atHead
          ? " Nothing new to publish."
          : "";
  const conflicts =
    state.conflicts > 0
      ? ` ${files(state.conflicts)} changed outside the editor and will not be published.`
      : "";
  const lead = (() => {
    switch (state.kind) {
      case "unpublished":
        return "This site has not been published yet.";
      case "building":
        return state.live
          ? `Building. Readers still see ${shortSha(state.live)} until it finishes.`
          : "Building the first version of this site.";
      case "live":
        return state.atHead
          ? `Live at ${shortSha(state.sha)}.`
          : `Live at ${shortSha(state.sha)}. Newer commits are not built yet.`;
      case "failed":
        return state.live
          ? `The last build failed. Readers still see ${shortSha(state.live)}.`
          : "The build failed, so the site is not online yet.";
    }
  })();
  return (
    <p className="text-muted-foreground">
      {lead}
      {pending}
      {conflicts}
    </p>
  );
}

function BuildError({ error }: { error: string }) {
  const lines = error.trim().split("\n");
  // Astro prints timestamped progress lines and a "build failed:" heading before the cause.
  const summary =
    lines.find((line) => line.trim() && !/^\d\d:\d\d:\d\d /.test(line) && !line.endsWith(":")) ??
    lines[0];
  if (lines.length === 1) {
    return (
      <p className="rounded-lg border border-destructive/32 bg-destructive/4 px-3 py-2 font-medium text-destructive-foreground">
        {summary}
      </p>
    );
  }
  return (
    <Collapsible className="rounded-lg border border-destructive/32 bg-destructive/4">
      <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left font-medium text-destructive-foreground">
        <span className="truncate">{summary}</span>
        <span className="ms-auto shrink-0 font-normal text-xs">Full output</span>
        <IconChevronDownOutlineDuo18 className="size-4 shrink-0 transition-transform group-data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words border-destructive/32 border-t px-3 py-2 font-mono text-xs">
          {error}
        </pre>
      </CollapsiblePanel>
    </Collapsible>
  );
}

function PublishErrorAlert({ error }: { error: PublishError }) {
  if (!isDefinedError(error)) {
    return (
      <Alert variant="error">
        <AlertTitle>Publishing failed</AlertTitle>
        <AlertDescription>
          <p>{errorMessage(error)}</p>
        </AlertDescription>
      </Alert>
    );
  }
  switch (error.code) {
    case "PAYMENT_REQUIRED":
      return (
        <Alert variant="warning">
          <AlertTitle>
            {error.data.reason === "trial_expired" ? "Your trial has ended" : "No active plan"}
          </AlertTitle>
          <AlertDescription>
            <p>
              Choose a plan to publish.{" "}
              <Link to="/settings/billing" className="underline underline-offset-4">
                View plans
              </Link>
            </p>
          </AlertDescription>
        </Alert>
      );
    case "CONFLICT":
      return (
        <Alert variant="warning">
          <AlertTitle>The site changed while publishing</AlertTitle>
          <AlertDescription>
            <p>Someone pushed to this site at the same time. Publish again.</p>
          </AlertDescription>
        </Alert>
      );
    case "NOT_FOUND":
      return (
        <Alert variant="error">
          <AlertTitle>This site no longer exists</AlertTitle>
          <AlertDescription>
            <p>It may have been deleted. Reload the page.</p>
          </AlertDescription>
        </Alert>
      );
    default:
      return (
        <Alert variant="error">
          <AlertTitle>{error.message}</AlertTitle>
        </Alert>
      );
  }
}
