import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@shiru/ui/card";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@shiru/ui/dialog";
import { Skeleton } from "@shiru/ui/skeleton";
import { toastManager } from "@shiru/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { cn } from "@/utils/cn";
import { orpc } from "@/utils/orpc-client";

export const Route = createFileRoute("/_app/docs/history")({
  component: HistoryPage,
});

const STATUS_COLORS: Record<string, string> = {
  publishing: "bg-cyan-100 text-cyan-800",
  published: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[status] ?? "bg-neutral-100 text-neutral-600",
      )}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryPage() {
  const queryClient = useQueryClient();
  const [rollbackTarget, setRollbackTarget] = useState<{
    version: number;
    createdAt: string;
  } | null>(null);

  const siteQuery = useQuery(orpc.docs.siteSettings.get.queryOptions());
  const site = siteQuery.data;

  const historyQuery = useQuery(orpc.docs.versionHistory.list.queryOptions({ limit: 20 }));
  const versions = historyQuery.data?.versions ?? [];

  const rollbackMutation = useMutation({
    ...orpc.docs.rollback.trigger.mutationOptions(),
    onSuccess: () => {
      toastManager.add({ title: "Rolled back successfully" });
      setRollbackTarget(null);
      queryClient.invalidateQueries({
        queryKey: orpc.docs.siteSettings.get.queryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: orpc.docs.versionHistory.list.queryOptions({ limit: 20 }).queryKey,
      });
    },
    onError: (error) => {
      toastManager.add({ title: "Rollback failed", description: error.message });
    },
  });

  if (historyQuery.isLoading) {
    return (
      <div className="space-y-3 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>No versions yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Publish your docs to create your first version.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-4">
      {versions.map((version) => {
        const isActive = site?.activeVersion === version.version;
        const canRollback = !isActive && version.status === "published";

        return (
          <div
            key={version.id}
            className={cn(
              "flex items-center justify-between rounded-lg border border-border p-4",
              isActive && "border-emerald-200 bg-emerald-50/50",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <StatusBadge status={version.status} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">v{version.version}</p>
                  {isActive && <span className="text-xs font-medium text-emerald-700">Live</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(version.createdAt)}
                  {version.fileCount ? ` · ${version.fileCount} files` : ""}
                  {version.sourceRef ? ` · ${version.sourceRef.slice(0, 7)}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {version.status === "failed" && version.failureCode && (
                <span className="text-xs text-red-600">{version.failureCode}</span>
              )}
              {canRollback && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRollbackTarget({ version: version.version, createdAt: version.createdAt })
                  }
                >
                  Rollback
                </Button>
              )}
            </div>
          </div>
        );
      })}

      <Dialog open={!!rollbackTarget} onOpenChange={(open) => !open && setRollbackTarget(null)}>
        <DialogPopup>
          <DialogPanel>
            <DialogHeader>
              <DialogTitle>Roll back to version {rollbackTarget?.version}?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-4">
              This will instantly switch your live docs to the version from{" "}
              {rollbackTarget ? formatDate(rollbackTarget.createdAt) : ""}. Your current version
              will remain available if you need to switch back.
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                disabled={rollbackMutation.isPending}
                onClick={() => {
                  if (rollbackTarget) {
                    rollbackMutation.mutate({ targetVersion: rollbackTarget.version });
                  }
                }}
              >
                {rollbackMutation.isPending ? "Rolling back..." : "Roll back"}
              </Button>
            </DialogFooter>
          </DialogPanel>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
