import { Alert, AlertAction, AlertDescription, AlertTitle } from "@shiru/ui/components/alert";
import { Button } from "@shiru/ui/components/button";
import { Badge } from "@shiru/ui/components/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shiru/ui/components/card";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@shiru/ui/components/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shiru/ui/components/empty";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { IconBookOpen2OutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { useState } from "react";

import { CreateSiteForm } from "@/components/create-site-form";
import { Page } from "@/components/page";
import { accessLabel } from "@/lib/access";
import { accessQuery, useSession } from "@/lib/queries";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const { data: access } = useQuery(accessQuery);
  const { data: sites } = useQuery(orpc.sites.list.queryOptions());
  const publicSite = sites?.find((site) => site.visibility === "public");
  const [creating, setCreating] = useState(false);

  return (
    <Page title="Dashboard" description={`Welcome back, ${user.name}.`}>
      {access && access.kind !== "subscription" && (
        <Alert variant={access.kind === "trial" ? "info" : "warning"}>
          <AlertTitle>{accessLabel(access)}</AlertTitle>
          <AlertDescription>
            {access.kind === "trial"
              ? "Pick a plan before your trial ends to keep your docs online."
              : "Choose a plan to keep using Shiru."}
          </AlertDescription>
          <AlertAction>
            <Button size="sm" render={<Link to="/settings/billing" />}>
              View plans
            </Button>
          </AlertAction>
        </Alert>
      )}
      {sites &&
        (publicSite ? (
          <Card>
            <CardHeader>
              <CardTitle>{publicSite.name}</CardTitle>
              <CardDescription>{new URL(publicSite.url).host}</CardDescription>
              <CardAction>
                <Badge variant="outline">Not published yet</Badge>
              </CardAction>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconBookOpen2OutlineDuo18 />
                </EmptyMedia>
                <EmptyTitle>No public docs site yet</EmptyTitle>
                <EmptyDescription>
                  Create the site where people and coding agents read your documentation.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setCreating(true)}>Create public docs site</Button>
              </EmptyContent>
            </Empty>
          </Card>
        ))}
      {/* Outside the empty state, so a conflict that reveals a site keeps the dialog's message. */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogPopup className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create public docs site</DialogTitle>
            <DialogDescription>
              Choose a name and the address it will be served at.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <CreateSiteForm onCreated={() => setCreating(false)} />
          </DialogPanel>
        </DialogPopup>
      </Dialog>
    </Page>
  );
}
