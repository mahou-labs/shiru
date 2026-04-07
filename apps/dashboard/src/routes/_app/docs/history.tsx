import { Badge } from "@shiru/ui/badge";
import { Button } from "@shiru/ui/button";
import { Card, CardHeader } from "@shiru/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@shiru/ui/empty";
import { Skeleton } from "@shiru/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { IconAlertWarningOutlineDuo18, IconBookOpen2OutlineDuo18 } from "nucleo-ui-outline-duo-18";

import { cn } from "@/utils/cn";
import { orpc } from "@/utils/orpc-client";

export const Route = createFileRoute("/_app/docs/history")({
  component: HistoryPage,
});

type VersionStatus = "building" | "published" | "failed";

type Version = {
  id: string;
  versionRef: string;
  status: VersionStatus;
  createdAt: Date;
};

const STATUS_LABEL: Record<VersionStatus, string> = {
  building: "Publishing",
  published: "Published",
  failed: "Failed",
};

const STATUS_VARIANT: Record<VersionStatus, "info" | "success" | "error"> = {
  building: "info",
  published: "success",
  failed: "error",
};

const RELATIVE_TIME = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const RELATIVE_THRESHOLDS: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] =
  [
    { limit: 60, divisor: 1, unit: "second" },
    { limit: 60 * 60, divisor: 60, unit: "minute" },
    { limit: 60 * 60 * 24, divisor: 60 * 60, unit: "hour" },
    { limit: 60 * 60 * 24 * 7, divisor: 60 * 60 * 24, unit: "day" },
    { limit: 60 * 60 * 24 * 30, divisor: 60 * 60 * 24 * 7, unit: "week" },
    { limit: 60 * 60 * 24 * 365, divisor: 60 * 60 * 24 * 30, unit: "month" },
  ];

function formatRelativeTime(date: Date): string {
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  for (const { limit, divisor, unit } of RELATIVE_THRESHOLDS) {
    if (absSeconds < limit) {
      return RELATIVE_TIME.format(Math.round(diffSeconds / divisor), unit);
    }
  }
  return RELATIVE_TIME.format(Math.round(diffSeconds / (60 * 60 * 24 * 365)), "year");
}

function formatAbsoluteTime(date: Date): string {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortSha(versionRef: string): string {
  return versionRef.slice(0, 7);
}

function PageLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl">{children}</div>;
}

function PageHeading() {
  return <h2 className="font-heading text-xl">Publish history</h2>;
}

function LoadingState() {
  return (
    <PageLayout>
      <PageHeading />
      <Card className="mt-6">
        <CardHeader className="gap-3">
          <Skeleton className="h-5 w-24 rounded-sm" />
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-sm" />
        </CardHeader>
      </Card>
      <ul className="mt-10 divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 py-3.5">
            <Skeleton className="h-4 w-16 rounded-sm" />
            <div className="flex-1" />
            <Skeleton className="h-5 w-20 rounded-sm" />
            <Skeleton className="hidden h-3 w-20 rounded-sm sm:block" />
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}

function ErrorState({ message }: { message: string }) {
  const description = message.trim() || "Try refreshing the page or come back in a moment.";
  return (
    <PageLayout>
      <PageHeading />
      <div className="mt-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconAlertWarningOutlineDuo18 />
            </EmptyMedia>
            <EmptyTitle>Couldn't load publish history</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </PageLayout>
  );
}

function EmptyHistoryState() {
  return (
    <PageLayout>
      <PageHeading />
      <div className="mt-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconBookOpen2OutlineDuo18 />
            </EmptyMedia>
            <EmptyTitle>No publishes yet</EmptyTitle>
            <EmptyDescription>
              Publish your docs from the overview to see them appear here.
            </EmptyDescription>
          </EmptyHeader>
          <Button render={<Link to="/docs" />}>Go to overview</Button>
        </Empty>
      </div>
    </PageLayout>
  );
}

function LiveVersionCard({ version }: { version: Version }) {
  return (
    <Card className="border-success/40">
      <CardHeader className="gap-3">
        <Badge variant="success" className="w-fit">
          Currently live
        </Badge>
        <p className="font-mono font-semibold text-3xl tracking-tight">
          {shortSha(version.versionRef)}
        </p>
        <p className="text-muted-foreground text-sm">
          Published {formatRelativeTime(version.createdAt)} ·{" "}
          <time dateTime={version.createdAt.toISOString()}>
            {formatAbsoluteTime(version.createdAt)}
          </time>
        </p>
      </CardHeader>
    </Card>
  );
}

function HistoryRow({ version }: { version: Version }) {
  return (
    <li className="flex items-center gap-4 py-3.5">
      <span className="flex-1 font-mono text-sm tracking-tight">
        {shortSha(version.versionRef)}
      </span>
      <Badge variant={STATUS_VARIANT[version.status]}>{STATUS_LABEL[version.status]}</Badge>
      <time
        className="hidden w-24 text-right text-muted-foreground text-xs tabular-nums sm:inline-block"
        dateTime={version.createdAt.toISOString()}
        title={formatAbsoluteTime(version.createdAt)}
      >
        {formatRelativeTime(version.createdAt)}
      </time>
    </li>
  );
}

function HistoryPage() {
  const historyQuery = useQuery(orpc.docs.listVersions.queryOptions({ input: { limit: 20 } }));

  if (historyQuery.isLoading) {
    return <LoadingState />;
  }

  if (historyQuery.isError) {
    return <ErrorState message={historyQuery.error.message} />;
  }

  const versions = historyQuery.data?.versions ?? [];
  const activeRef = historyQuery.data?.activeCommitSha ?? null;

  if (versions.length === 0) {
    return <EmptyHistoryState />;
  }

  const liveVersion = activeRef
    ? versions.find((v) => v.versionRef === activeRef && v.status === "published")
    : undefined;

  const earlierPublishes = liveVersion ? versions.filter((v) => v.id !== liveVersion.id) : versions;

  return (
    <PageLayout>
      <PageHeading />
      {liveVersion && (
        <div className="mt-6">
          <LiveVersionCard version={liveVersion} />
        </div>
      )}
      {earlierPublishes.length > 0 && (
        <ul className={cn("divide-y divide-border", liveVersion ? "mt-10" : "mt-6")}>
          {earlierPublishes.map((version) => (
            <HistoryRow key={version.id} version={version} />
          ))}
        </ul>
      )}
    </PageLayout>
  );
}
