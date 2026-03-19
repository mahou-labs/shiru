import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  IconGlobe2OutlineDuo18,
  IconCircleCheckOutlineDuo18,
  IconCopyOutlineDuo18,
  IconTrashOutlineDuo18,
  IconArrowRotateClockwiseOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@shiru/ui/dialog";
import { Field, FieldError, FieldLabel } from "@shiru/ui/field";
import { Form } from "@shiru/ui/form";
import { Input } from "@shiru/ui/input";
import { Skeleton } from "@shiru/ui/skeleton";
import { toastManager } from "@shiru/ui/toast";
import { cn } from "@/utils/cn";
import { orpc } from "@/utils/orpc-client";

const HOSTNAME_REGEX = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

const hostnameSchema = z.object({
  hostname: z
    .string()
    .min(1, "Hostname is required")
    .regex(HOSTNAME_REGEX, "Enter a valid hostname like docs.example.com"),
});

export const Route = createFileRoute("/_app/settings/domain")({
  component: DomainSettingsRoute,
});

function DomainSettingsRoute() {
  const queryClient = useQueryClient();
  const { data: domain, isPending } = useQuery(orpc.domain.getDomain.queryOptions());
  const { mutateAsync: createDomain } = useMutation(orpc.domain.createDomain.mutationOptions());
  const { mutateAsync: checkStatus, isPending: isChecking } = useMutation(
    orpc.domain.checkDomainStatus.mutationOptions(),
  );
  const { mutateAsync: deleteDomain } = useMutation(orpc.domain.deleteDomain.mutationOptions());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Auto-poll when domain is pending
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function refreshStatus() {
    try {
      await checkStatus({});
      await queryClient.invalidateQueries(orpc.domain.getDomain.queryOptions());
    } catch {
      // Silently handle polling errors
    }
  }

  useEffect(() => {
    async function refreshPendingDomainStatus() {
      try {
        await checkStatus({});
        await queryClient.invalidateQueries(orpc.domain.getDomain.queryOptions());
      } catch {
        // Silently handle polling errors
      }
    }

    if (domain && domain.status === "pending_verification") {
      pollIntervalRef.current = setInterval(refreshPendingDomainStatus, 30_000);
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  }, [checkStatus, domain, queryClient]);

  const form = useForm({
    defaultValues: { hostname: "" },
    validators: { onSubmit: hostnameSchema },
    onSubmit: async ({ value }) => {
      try {
        await createDomain({ hostname: value.hostname });
        await queryClient.invalidateQueries(orpc.domain.getDomain.queryOptions());
        toastManager.add({
          title: "Domain registered, follow the DNS instructions below",
          type: "success",
        });
        form.reset();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to register domain";
        toastManager.add({ title: message, type: "error" });
      }
    },
  });

  const handleDelete = async () => {
    try {
      await deleteDomain({});
      await queryClient.invalidateQueries(orpc.domain.getDomain.queryOptions());
      await queryClient.invalidateQueries(orpc.onboarding.getOnboardingStatus.queryOptions());
      toastManager.add({ title: "Domain removed", type: "success" });
      setIsDeleteDialogOpen(false);
    } catch {
      toastManager.add({ title: "Failed to remove domain", type: "error" });
    }
  };

  const handleCheckStatus = async () => {
    try {
      await refreshStatus();
      await queryClient.invalidateQueries(orpc.onboarding.getOnboardingStatus.queryOptions());
      toastManager.add({ title: "Status refreshed", type: "success" });
    } catch {
      toastManager.add({ title: "Failed to check status", type: "error" });
    }
  };

  if (isPending) {
    return (
      <div className="space-y-6 pt-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // No domain configured -- show setup form
  if (!domain) {
    return (
      <div className="space-y-6 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <IconGlobe2OutlineDuo18 className="mr-2 inline size-5" />
              Custom Domain
            </CardTitle>
            <CardDescription>
              Connect a custom domain to serve your documentation. Your users will access docs at
              your own subdomain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                await form.handleSubmit();
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <form.Field
                  name="hostname"
                  validators={{ onChange: hostnameSchema.shape.hostname }}
                >
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel>Hostname</FieldLabel>
                      <Input
                        disabled={form.state.isSubmitting}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="docs.example.com"
                        value={field.state.value}
                      />
                      {field.state.meta.isTouched &&
                        field.state.meta.errors.map((error) => (
                          <FieldError key={error?.message}>{error?.message}</FieldError>
                        ))}
                    </Field>
                  )}
                </form.Field>

                <Button
                  disabled={
                    form.state.isSubmitting || !HOSTNAME_REGEX.test(form.state.values.hostname)
                  }
                  type="submit"
                  className="shrink-0"
                >
                  {form.state.isSubmitting ? "Connecting..." : "Connect Domain"}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Domain exists -- show status
  const isActive = domain.status === "active" && domain.sslStatus === "active";
  const isError = domain.status === "error";
  const isPendingVerification = domain.status === "pending_verification";

  return (
    <div className="space-y-6 pt-4">
      {/* Domain Status Card */}
      <Card className={cn(isActive && "border-success/30", isError && "border-destructive/30")}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                <IconGlobe2OutlineDuo18 className="mr-2 inline size-5" />
                {domain.hostname}
              </CardTitle>
              <CardDescription className="mt-1">
                {isActive && "Your custom domain is live and serving traffic."}
                {isPendingVerification &&
                  "Complete the DNS configuration below to activate your domain."}
                {isError && "There was an issue verifying your domain."}
              </CardDescription>
            </div>
            <DomainStatusBadge status={domain.status} sslStatus={domain.sslStatus} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {isPendingVerification && (
              <Button variant="outline" size="sm" onClick={handleCheckStatus} disabled={isChecking}>
                <IconArrowRotateClockwiseOutlineDuo18
                  className={cn("mr-1.5 size-3.5", isChecking && "animate-spin")}
                />
                {isChecking ? "Checking..." : "Check Status"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <IconTrashOutlineDuo18 className="mr-1.5 size-3.5" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DNS Instructions -- shown when pending */}
      {(isPendingVerification || isError) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">DNS Configuration</CardTitle>
            <CardDescription>
              Add the following DNS records to your domain provider. It can take a few minutes for
              changes to propagate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CNAME Record */}
            <DnsRecord
              type="CNAME"
              name={domain.hostname}
              value="docs.shiru.sh"
              description="Points your domain to Shiru's servers"
            />

            {/* Ownership TXT Record */}
            {domain.verificationTxtName && domain.verificationTxtValue && (
              <DnsRecord
                type="TXT"
                name={domain.verificationTxtName}
                value={domain.verificationTxtValue}
                description="Proves domain ownership"
              />
            )}

            {/* SSL Validation TXT Record */}
            {domain.sslValidationTxtName && domain.sslValidationTxtValue && (
              <DnsRecord
                type="TXT"
                name={domain.sslValidationTxtName}
                value={domain.sslValidationTxtValue}
                description="Validates SSL certificate issuance"
              />
            )}

            {domain.errorMessage && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-destructive/80 text-sm">{domain.errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active state success message */}
      {isActive && (
        <Card className="border-success/20 bg-success/[0.02]">
          <CardContent className="flex items-center gap-3 pt-6">
            <IconCircleCheckOutlineDuo18 className="size-5 shrink-0 text-success" />
            <div>
              <p className="text-sm font-medium">Domain verified and SSL active</p>
              <p className="text-sm text-muted-foreground">
                Your documentation is accessible at{" "}
                <a
                  href={`https://${domain.hostname}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {domain.hostname}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
        <DialogPopup className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Custom Domain</DialogTitle>
          </DialogHeader>
          <DialogPanel>
            <p className="text-sm text-muted-foreground">
              This will disconnect <strong>{domain.hostname}</strong> from your documentation. Your
              docs will no longer be accessible at this domain.
            </p>
          </DialogPanel>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  type="button"
                  variant="ghost"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Remove Domain
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}

// -- Subcomponents --

function DomainStatusBadge({
  status,
  sslStatus,
}: {
  status: string | null;
  sslStatus: string | null;
}) {
  if (status === "active" && sslStatus === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success-foreground">
        <span className="size-1.5 rounded-full bg-success" />
        Active
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive-foreground">
        <span className="size-1.5 rounded-full bg-destructive" />
        Error
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
      <span className="size-1.5 animate-pulse rounded-full bg-warning" />
      Verifying
    </span>
  );
}

function DnsRecord({
  type,
  name,
  value,
  description,
}: {
  type: string;
  name: string;
  value: string;
  description: string;
}) {
  const [copied, setCopied] = useState<"name" | "value" | null>(null);

  const copyToClipboard = async (text: string, field: "name" | "value") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toastManager.add({ title: "Failed to copy", type: "error" });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
          {type}
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">Name</span>
          <code className="flex-1 truncate rounded bg-muted/50 px-2 py-1 font-mono text-xs">
            {name}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => copyToClipboard(name, "name")}
            aria-label="Copy name"
          >
            {copied === "name" ? (
              <IconCircleCheckOutlineDuo18 className="size-3.5 text-success" />
            ) : (
              <IconCopyOutlineDuo18 className="size-3.5" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">Value</span>
          <code className="flex-1 truncate rounded bg-muted/50 px-2 py-1 font-mono text-xs">
            {value}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => copyToClipboard(value, "value")}
            aria-label="Copy value"
          >
            {copied === "value" ? (
              <IconCircleCheckOutlineDuo18 className="size-3.5 text-success" />
            ) : (
              <IconCopyOutlineDuo18 className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
