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
import { Link } from "@tanstack/react-router";
import {
  IconArrowUpRightOutlineDuo18,
  IconChevronDownOutlineDuo18,
  IconPencilOutlineDuo18,
} from "nucleo-ui-outline-duo-18";

import { PublishTimeline } from "@/components/publish-timeline";
import { canPublish, usePublish, type PublishState } from "@/hooks/use-publish";
import { buildErrorSummary } from "@/lib/build-error";
import { errorMessage } from "@/lib/errors";
import { formatDuration } from "@/lib/publish-timeline";

import type { Run } from "../../../api/src/docs/runs";
import type { AppRouterClient } from "../../../api/src/routers";

type Outputs = InferClientOutputs<AppRouterClient>["docs"];
type Doc = Outputs["list"][number];
type PublishError = InferClientErrors<AppRouterClient>["docs"]["publish"];

const shortSha = (sha: string) => sha.slice(0, 7);
const files = (count: number) => (count === 1 ? "1 file" : `${count} files`);

export function DocCard({ doc }: { doc: Doc }) {
  const { state, run, publish } = usePublish(doc.id, { silent: true });
  const live = state && (state.kind === "live" ? state.sha : "live" in state ? state.live : null);
  const host = new URL(doc.url).host;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{doc.name}</CardTitle>
        <CardDescription>
          {live ? (
            <a
              href={doc.url}
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
          <StatusLine state={state} run={run} />
          {run && (state.kind === "building" || state.kind === "failed") && (
            <PublishTimeline run={run} />
          )}
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
      <CardFooter className="gap-2">
        {state && (
          <Button
            loading={publish.isPending}
            disabled={!canPublish(state)}
            onClick={() => publish.mutate({ docId: doc.id })}
          >
            {state.kind === "building" ? "Publishing…" : "Publish"}
          </Button>
        )}
        {doc.source.kind === "managed" && (
          <Button
            variant="outline"
            render={<Link to="/docs/$docId/editor" params={{ docId: doc.id }} />}
          >
            <IconPencilOutlineDuo18 />
            Edit
          </Button>
        )}
        {live && (
          <Button variant="outline" render={<a href={doc.url} target="_blank" rel="noreferrer" />}>
            Open site
            <IconArrowUpRightOutlineDuo18 />
          </Button>
        )}
      </CardFooter>
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

function StatusLine({ state, run }: { state: PublishState; run?: Run }) {
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
        return `Live at ${shortSha(state.sha)}.${tookLine(run)}${state.atHead ? "" : " Newer commits are not built yet."}`;
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

/** How long the last successful publish took, when the timeline has it. */
function tookLine(run: Run | undefined) {
  const queued = run?.steps.queued;
  if (!run?.ended?.ok || queued === undefined) return "";
  return ` Last publish took ${formatDuration(run.ended.at - queued)}.`;
}

function BuildError({ error }: { error: string }) {
  const summary = buildErrorSummary(error);
  if (!error.trim().includes("\n")) {
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
