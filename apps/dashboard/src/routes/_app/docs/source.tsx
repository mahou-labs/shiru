import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";
import { Field, FieldError, FieldLabel } from "@shiru/ui/field";
import { Form } from "@shiru/ui/form";
import { Input } from "@shiru/ui/input";
import { Skeleton } from "@shiru/ui/skeleton";
import { toastManager } from "@shiru/ui/toast";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc-client";

export const Route = createFileRoute("/_app/docs/source")({
  component: SourceConfigPage,
});

function SourceConfigPage() {
  const queryClient = useQueryClient();

  const sourceQuery = useQuery(orpc.docs.sourceConfig.get.queryOptions());
  const source = sourceQuery.data;

  const updateMutation = useMutation({
    ...orpc.docs.sourceConfig.update.mutationOptions(),
    onSuccess: () => {
      toastManager.add({ title: "Source configuration updated" });
      queryClient.invalidateQueries({
        queryKey: orpc.docs.sourceConfig.get.queryOptions().queryKey,
      });
    },
    onError: (error) => {
      toastManager.add({ title: "Update failed", description: error.message });
    },
  });

  const form = useForm({
    defaultValues: {
      mode: (source?.mode ?? "github") as "managed" | "github",
      publishableBranch: source?.publishableBranch ?? "main",
      contentPath: source?.contentPath ?? "docs",
      githubOwner: source?.githubOwner ?? "",
      githubRepository: source?.githubRepository ?? "",
    },
    onSubmit: async ({ value }) => {
      if (value.mode === "github") {
        updateMutation.mutate({
          mode: "github",
          publishableBranch: value.publishableBranch,
          contentPath: value.contentPath,
          githubOwner: value.githubOwner,
          githubRepository: value.githubRepository,
          githubInstallationId: "pending",
        });
      } else {
        updateMutation.mutate({
          mode: "managed",
          publishableBranch: value.publishableBranch,
          contentPath: value.contentPath,
        });
      }
    },
  });

  if (sourceQuery.isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (sourceQuery.isError) {
    return (
      <div className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Source not configured</CardTitle>
            <CardDescription>
              Your docs source hasn't been set up yet. This usually happens automatically when your
              organization is created.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Source Configuration</CardTitle>
          <CardDescription>Configure where your documentation content comes from</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="space-y-4">
              {/* GitHub Repository */}
              <div className="space-y-4">
                <form.Field name="githubOwner">
                  {(field) => (
                    <Field>
                      <FieldLabel>Repository Owner</FieldLabel>
                      <Input
                        placeholder="your-org"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      )}
                    </Field>
                  )}
                </form.Field>

                <form.Field name="githubRepository">
                  {(field) => (
                    <Field>
                      <FieldLabel>Repository Name</FieldLabel>
                      <Input
                        placeholder="docs"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      )}
                    </Field>
                  )}
                </form.Field>

                <form.Field name="publishableBranch">
                  {(field) => (
                    <Field>
                      <FieldLabel>Branch</FieldLabel>
                      <Input
                        placeholder="main"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      )}
                    </Field>
                  )}
                </form.Field>

                <form.Field name="contentPath">
                  {(field) => (
                    <Field>
                      <FieldLabel>Content Path</FieldLabel>
                      <Input
                        placeholder="docs"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <p className="text-xs text-muted-foreground">
                        Subdirectory in your repository containing MDX files
                      </p>
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      )}
                    </Field>
                  )}
                </form.Field>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Current Configuration */}
      {source && (
        <Card>
          <CardHeader>
            <CardTitle>Current Source</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground w-24 shrink-0">Mode</dt>
                <dd className="font-medium">{source.mode}</dd>
              </div>
              {source.githubOwner && (
                <div className="flex gap-2">
                  <dt className="text-muted-foreground w-24 shrink-0">Repository</dt>
                  <dd className="font-medium">
                    {source.githubOwner}/{source.githubRepository}
                  </dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="text-muted-foreground w-24 shrink-0">Branch</dt>
                <dd className="font-medium">{source.publishableBranch}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground w-24 shrink-0">Content path</dt>
                <dd className="font-medium">{source.contentPath}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
