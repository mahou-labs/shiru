import { Button } from "@shiru/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";
import { Skeleton } from "@shiru/ui/skeleton";
import { toastManager } from "@shiru/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc-client";

export const Route = createFileRoute("/_app/docs/")({
  component: DocsOverview,
});

function DocsOverview() {
  const queryClient = useQueryClient();

  const siteQuery = useQuery(orpc.docs.siteSettings.get.queryOptions());
  const site = siteQuery.data;

  const publishMutation = useMutation({
    ...orpc.docs.publish.trigger.mutationOptions(),
    onSuccess: (data) => {
      if (data.deduplicated) {
        toastManager.add({ title: "A publish is already in progress" });
      } else {
        toastManager.add({
          title: "Published successfully",
          description: `Version ${data.version}`,
        });
        queryClient.invalidateQueries({
          queryKey: orpc.docs.siteSettings.get.queryOptions().queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: orpc.docs.versionHistory.list.queryOptions({ limit: 20 }).queryKey,
        });
      }
    },
    onError: (error) => {
      toastManager.add({ title: "Publish failed", description: error.message });
    },
  });

  if (siteQuery.isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (siteQuery.isError) {
    return (
      <div className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Docs not available</CardTitle>
            <CardDescription>
              {siteQuery.error.message.includes("not found")
                ? "Your docs site hasn't been set up yet. This usually happens automatically — try refreshing."
                : "Something went wrong loading your docs settings."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Publish Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Publish</CardTitle>
              <CardDescription>
                Fetch your latest docs from GitHub and publish them instantly
              </CardDescription>
            </div>
            <Button
              disabled={publishMutation.isPending}
              onClick={() => {
                if (site?.id) {
                  publishMutation.mutate({ docsSiteId: site.id });
                }
              }}
            >
              {publishMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Production Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Production</CardTitle>
          <CardDescription>
            {site?.activeVersion
              ? `Version ${site.activeVersion} is live`
              : "No version deployed yet. Publish to make your docs live."}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/docs/history"
          className="flex items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent"
        >
          <div>
            <p className="text-sm font-medium">Version History</p>
            <p className="mt-0.5 text-sm text-muted-foreground">View all versions and rollback</p>
          </div>
        </Link>
        <Link
          to="/docs/source"
          className="flex items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent"
        >
          <div>
            <p className="text-sm font-medium">Source Configuration</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Repository and branch settings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
