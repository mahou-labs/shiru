import { isDefinedError, type InferClientErrors, type InferClientOutputs } from "@orpc/client";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@shiru/ui/components/alert-dialog";
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/components/field";
import { Form } from "@shiru/ui/components/form";
import { Input } from "@shiru/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shiru/ui/components/table";
import { toastManager } from "@shiru/ui/components/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { IconArrowUpRightOutlineDuo18, IconCopyOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { useEffect, useState } from "react";

import { errorMessage } from "@/lib/errors";
import { orpc } from "@/utils/orpc";

import { CustomHostname } from "../../../api/src/docs/names";
import type { AppRouterClient } from "../../../api/src/routers";

type Outputs = InferClientOutputs<AppRouterClient>["docs"];
type Doc = Outputs["list"][number];
type Domain = NonNullable<Outputs["domain"]["get"]>;
type AddError = InferClientErrors<AppRouterClient>["docs"]["domain"]["add"];

const POLL_MS = 10_000;

// Still settling: waiting for DNS, or a removal the cron finishes.
const POLLED: ReadonlySet<Domain["status"]> = new Set(["pending", "removing"]);

/** The hostname the doc is served at once the domain is active, or null for its own address. */
const activeHostname = (domain: Domain | null) =>
  domain?.status === "active" ? domain.hostname : null;

/** The doc's custom domain: adding one, the DNS record to create, and whether it works yet. */
export function DomainCard({ doc }: { doc: Doc }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...orpc.docs.domain.get.queryOptions({ input: { docId: doc.id } }),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && POLLED.has(status) ? POLL_MS : false;
    },
  });
  const domain = query.data;

  // The doc's URL follows the domain's status, and loading the domain can change it, the first
  // load included, so DocCard's link is read again whenever the hostname it should show is known.
  const servedAt = domain === undefined ? undefined : activeHostname(domain);
  useEffect(() => {
    if (servedAt === undefined) return;
    void queryClient.invalidateQueries({ queryKey: orpc.docs.list.key() });
  }, [queryClient, servedAt]);

  if (query.isPending) return null;
  // Only a first load that failed. A failed poll keeps showing the domain it already has.
  if (domain === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom domain</CardTitle>
        </CardHeader>
        <CardPanel>
          <Alert variant="error">
            <AlertTitle>The custom domain could not be loaded</AlertTitle>
            <AlertDescription>
              <p>{errorMessage(query.error)}</p>
            </AlertDescription>
          </Alert>
        </CardPanel>
        <CardFooter>
          <Button variant="outline" loading={query.isFetching} onClick={() => query.refetch()}>
            Try again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom domain</CardTitle>
        <CardDescription>
          {domain ? (
            <DomainLink domain={domain} />
          ) : (
            "Serve this site at a domain you own, like docs.example.com."
          )}
        </CardDescription>
        {domain && (
          <CardAction>
            <StatusBadge status={domain.status} />
          </CardAction>
        )}
      </CardHeader>
      {domain ? <DomainDetails doc={doc} domain={domain} /> : <AddDomainForm docId={doc.id} />}
    </Card>
  );
}

function DomainLink({ domain }: { domain: Domain }) {
  if (domain.status !== "active") return domain.hostname;
  return (
    <a
      href={`https://${domain.hostname}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
    >
      {domain.hostname}
      <IconArrowUpRightOutlineDuo18 className="size-3.5" />
    </a>
  );
}

function StatusBadge({ status }: { status: Domain["status"] }) {
  switch (status) {
    case "pending":
      return <Badge variant="info">Waiting for DNS</Badge>;
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "failed":
      return <Badge variant="error">Not working</Badge>;
    case "removing":
      return <Badge variant="outline">Removing</Badge>;
  }
}

function AddDomainForm({ docId }: { docId: string }) {
  const queryClient = useQueryClient();
  const [hostname, setHostname] = useState("");
  const [invalid, setInvalid] = useState<string>();
  const add = useMutation({
    ...orpc.docs.domain.add.mutationOptions(),
    meta: { silent: true },
    onSuccess: (domain) => {
      queryClient.setQueryData(orpc.docs.domain.get.queryKey({ input: { docId } }), domain);
    },
  });

  return (
    <Form
      className="contents"
      onFormSubmit={() => {
        const parsed = CustomHostname.safeParse(hostname);
        if (!parsed.success) return setInvalid(parsed.error.issues[0]?.message);
        add.mutate({ docId, hostname: parsed.data });
      }}
    >
      <CardPanel className="flex flex-col gap-3">
        {add.error && <AddErrorAlert error={add.error} />}
        <Field name="hostname" invalid={invalid ? true : undefined}>
          <FieldLabel>Domain</FieldLabel>
          <Input
            value={hostname}
            onChange={(event) => {
              add.reset();
              setInvalid(undefined);
              setHostname(event.target.value);
            }}
            placeholder="docs.example.com"
            autoComplete="off"
            spellCheck={false}
            required
          />
          {invalid ? (
            <FieldError match>{invalid}.</FieldError>
          ) : (
            <FieldDescription>
              Next, you add one DNS record where you manage the domain.
            </FieldDescription>
          )}
        </Field>
      </CardPanel>
      <CardFooter>
        <Button type="submit" loading={add.isPending} disabled={!hostname.trim()}>
          Add domain
        </Button>
      </CardFooter>
    </Form>
  );
}

function DomainDetails({ doc, domain }: { doc: Doc; domain: Domain }) {
  const { data: docsDomain } = useQuery(orpc.docs.docsDomain.queryOptions({ staleTime: Infinity }));
  const address = `${doc.slug}.${docsDomain ?? ""}`;

  return (
    <>
      <CardPanel className="flex flex-col gap-3 text-sm">
        {domain.status === "active" ? (
          <p className="text-muted-foreground">
            Readers who visit {address} are redirected to {domain.hostname}.
          </p>
        ) : domain.status === "removing" ? (
          <p className="text-muted-foreground">
            {domain.hostname} no longer serves this site, but removing it did not finish. Remove it
            again.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground">
              {domain.status === "pending"
                ? "Add this record where you manage the domain. Once it resolves, the domain is usually active within a few minutes."
                : `Check that ${domain.hostname} has this record and no other record with the same name. If it does, remove the domain and add it again.`}
            </p>
            <DnsRecord record={domain.record} />
            {domain.errors.length > 0 && (
              <Alert variant={domain.status === "failed" ? "error" : "warning"}>
                <AlertTitle>
                  {domain.status === "failed" ? "The domain stopped working" : "Not verified yet"}
                </AlertTitle>
                <AlertDescription>
                  <ul className="flex flex-col gap-1">
                    {domain.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardPanel>
      <CardFooter>
        <RemoveDomainButton doc={doc} domain={domain} address={address} />
      </CardFooter>
    </>
  );
}

function DnsRecord({ record }: { record: Domain["record"] }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Target</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-mono">{record.type}</TableCell>
            <TableCell>
              <Copyable value={record.name} label="name" />
            </TableCell>
            <TableCell>
              <Copyable value={record.target} label="target" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}

function Copyable({ value, label }: { value: string; label: string }) {
  async function copy() {
    await navigator.clipboard.writeText(value);
    toastManager.add({ type: "success", title: `Copied the record ${label}` });
  }
  return (
    <div className="flex items-center gap-1">
      <span className="select-all break-all font-mono">{value}</span>
      <Button size="icon-xs" variant="ghost" aria-label={`Copy the record ${label}`} onClick={copy}>
        <IconCopyOutlineDuo18 />
      </Button>
    </div>
  );
}

function RemoveDomainButton({
  doc,
  domain,
  address,
}: {
  doc: Doc;
  domain: Domain;
  address: string;
}) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    ...orpc.docs.domain.remove.mutationOptions(),
    onSuccess: () => {
      queryClient.setQueryData(orpc.docs.domain.get.queryKey({ input: { docId: doc.id } }), null);
    },
    // A removal that fails part way has already stopped serving the domain, so read both again.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: orpc.docs.domain.get.queryKey({ input: { docId: doc.id } }),
        }),
        queryClient.invalidateQueries({ queryKey: orpc.docs.list.key() }),
      ]),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>Remove</AlertDialogTrigger>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {domain.hostname}?</AlertDialogTitle>
          <AlertDialogDescription>
            {domain.status === "active"
              ? `The site moves back to ${address} and ${domain.hostname} stops serving it.`
              : `${domain.hostname} will not serve this site.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
          <Button
            variant="destructive"
            loading={remove.isPending}
            onClick={() => remove.mutate({ docId: doc.id })}
          >
            Remove
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}

function AddErrorAlert({ error }: { error: AddError }) {
  if (!isDefinedError(error)) {
    return (
      <Alert variant="error">
        <AlertTitle>Adding the domain failed</AlertTitle>
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
              Choose a plan to add a custom domain.{" "}
              <Link to="/settings/billing" className="underline underline-offset-4">
                View plans
              </Link>
            </p>
          </AlertDescription>
        </Alert>
      );
    case "DOMAIN_EXISTS":
      return (
        <Alert variant="warning">
          <AlertTitle>This site already has a custom domain</AlertTitle>
          <AlertDescription>
            <p>It was added while this page was open. Reload the page to see it.</p>
          </AlertDescription>
        </Alert>
      );
    case "HOSTNAME_TAKEN":
      return (
        <Alert variant="error">
          <AlertTitle>Another site already uses this domain</AlertTitle>
          <AlertDescription>
            <p>Each domain can serve one site. Choose another, like a different subdomain.</p>
          </AlertDescription>
        </Alert>
      );
    case "HOSTNAME_NOT_ALLOWED":
      return (
        <Alert variant="error">
          <AlertTitle>This is already a Shiru address</AlertTitle>
          <AlertDescription>
            <p>Use a domain you own, like docs.example.com.</p>
          </AlertDescription>
        </Alert>
      );
    case "HOSTNAME_REJECTED":
      return (
        <Alert variant="error">
          <AlertTitle>Cloudflare refused this domain</AlertTitle>
          <AlertDescription>
            <p>{error.data.message}</p>
          </AlertDescription>
        </Alert>
      );
    case "NOT_CONFIGURED":
      return (
        <Alert variant="error">
          <AlertTitle>Custom domains are not available right now</AlertTitle>
          <AlertDescription>
            <p>Try again later.</p>
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
