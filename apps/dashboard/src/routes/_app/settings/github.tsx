import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";
import { Field, FieldLabel } from "@shiru/ui/field";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@shiru/ui/select";
import { Skeleton } from "@shiru/ui/skeleton";
import { toastManager } from "@shiru/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { orpc } from "@/utils/orpc-client";

export const Route = createFileRoute("/_app/settings/github")({
  component: GitHubSettingsPage,
});

const GITHUB_APP_SLUG = "shiru-docs-local-dev";

function GitHubSettingsPage() {
  const queryClient = useQueryClient();

  const { data: session } = useQuery(orpc.user.getSession.queryOptions());
  const connectionQuery = useQuery(orpc.github.getConnection.queryOptions());
  const connection = connectionQuery.data;

  const orgId = session?.session?.activeOrganizationId;

  const installUrl = orgId
    ? `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new?state=${orgId}`
    : null;

  if (connectionQuery.isLoading) {
    return (
      <div className="space-y-6 pt-4">
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <ConnectionCard
        connected={connection?.connected ?? false}
        githubOwner={connection?.githubOwner ?? null}
        githubInstallationId={connection?.githubInstallationId ?? null}
        installUrl={installUrl}
      />

      {connection?.connected && (
        <RepoSelectionCard
          currentRepo={connection.githubRepository}
          currentBranch={connection.publishableBranch}
          currentContentPath={connection.contentPath}
          onUpdated={() => queryClient.invalidateQueries({ queryKey: connectionQuery.queryKey })}
        />
      )}
    </div>
  );
}

function ConnectionCard({
  connected,
  githubOwner,
  githubInstallationId,
  installUrl,
}: {
  connected: boolean;
  githubOwner: string | null;
  githubInstallationId: string | null;
  installUrl: string | null;
}) {
  const manageUrl = githubInstallationId
    ? `https://github.com/settings/installations/${githubInstallationId}`
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Connection</CardTitle>
        <CardDescription>
          Connect your GitHub App to automatically sync documentation from a repository.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connected ? (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm">Connected</p>
              <p className="text-muted-foreground text-sm">
                Installed on <span className="font-medium text-foreground">{githubOwner}</span>
              </p>
            </div>
            {manageUrl && (
              <Button variant="outline" asChild>
                <a href={manageUrl} target="_blank" rel="noopener noreferrer">
                  Manage on GitHub
                </a>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              No GitHub App installed for this organization.
            </p>
            {installUrl && (
              <Button asChild>
                <a href={installUrl}>Install GitHub App</a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RepoSelectionCard({
  currentRepo,
  currentBranch,
  currentContentPath,
  onUpdated,
}: {
  currentRepo: string | null;
  currentBranch: string | null;
  currentContentPath: string | null;
  onUpdated: () => void;
}) {
  const [selectedRepo, setSelectedRepo] = useState(currentRepo ?? "");

  const reposQuery = useQuery({
    ...orpc.github.listRepos.queryOptions(),
    staleTime: 60_000,
  });

  const { mutateAsync: selectRepo, isPending: isSelecting } = useMutation({
    ...orpc.github.selectRepo.mutationOptions(),
    onSuccess: () => {
      toastManager.add({ title: "Repository updated" });
      onUpdated();
    },
    onError: (error) => {
      toastManager.add({ title: "Failed to update repository", description: error.message });
    },
  });

  const repos = reposQuery.data ?? [];
  const selectedRepoData = repos.find((r) => r.name === selectedRepo);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository</CardTitle>
        <CardDescription>Select which repository to use for your documentation.</CardDescription>
      </CardHeader>
      <CardContent>
        {reposQuery.isLoading ? (
          <Skeleton className="h-10 w-full rounded-md" />
        ) : repos.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No repositories found. Make sure the GitHub App has access to at least one repository.
          </p>
        ) : (
          <div className="space-y-4">
            <Field>
              <FieldLabel>Repository</FieldLabel>
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectPopup>
                  {repos.map((repo) => (
                    <SelectItem key={repo.id} value={repo.name}>
                      {repo.fullName}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>

            {currentRepo && (
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="w-28 shrink-0 text-muted-foreground">Current repo</dt>
                  <dd className="font-medium">{currentRepo}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-28 shrink-0 text-muted-foreground">Branch</dt>
                  <dd className="font-medium">{currentBranch ?? "main"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-28 shrink-0 text-muted-foreground">Content path</dt>
                  <dd className="font-medium">{currentContentPath ?? "docs"}</dd>
                </div>
              </dl>
            )}

            <div className="flex justify-end">
              <Button
                disabled={!selectedRepo || selectedRepo === currentRepo || isSelecting}
                onClick={() =>
                  selectRepo({
                    repository: selectedRepo,
                    branch: selectedRepoData?.defaultBranch ?? "main",
                  })
                }
              >
                {isSelecting ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
