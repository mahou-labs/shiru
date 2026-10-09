import { Alert, AlertAction, AlertDescription, AlertTitle } from "@shiru/ui/components/alert";
import { Button } from "@shiru/ui/components/button";
import { Card } from "@shiru/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shiru/ui/components/empty";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { IconBookOpen2OutlineDuo18 } from "nucleo-ui-outline-duo-18";

import { Page } from "@/components/page";
import { accessLabel } from "@/lib/access";
import { accessQuery, useSession } from "@/lib/queries";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const { data: access } = useQuery(accessQuery);

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
      <Card>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconBookOpen2OutlineDuo18 />
            </EmptyMedia>
            <EmptyTitle>No docs yet</EmptyTitle>
            <EmptyDescription>Your documentation sites will show up here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    </Page>
  );
}
