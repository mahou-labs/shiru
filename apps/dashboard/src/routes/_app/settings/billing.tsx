import { Badge } from "@shiru/ui/components/badge";
import { Button } from "@shiru/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@shiru/ui/components/card";
import { Skeleton } from "@shiru/ui/components/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Page } from "@/components/page";
import { accessLabel } from "@/lib/access";
import { authClient } from "@/lib/auth-client";
import { accessQuery, useSession } from "@/lib/queries";

export const Route = createFileRoute("/_app/settings/billing")({
  component: BillingSettings,
});

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });

function BillingSettings() {
  const { session } = useSession();
  const { data: access } = useQuery(accessQuery);

  const checkout = useMutation({
    mutationFn: () =>
      authClient.checkout({
        slug: "starter-monthly",
        referenceId: session.activeOrganizationId ?? undefined,
      }),
  });
  const portal = useMutation({ mutationFn: () => authClient.customer.portal() });

  return (
    <Page title="Billing" description="Your organization's plan and payment details.">
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>
            {!access ? (
              <Skeleton className="h-4 w-48" />
            ) : access.kind === "subscription" ? (
              `Renews on ${dateFormat.format(access.currentPeriodEnd)}.`
            ) : access.kind === "trial" ? (
              `Your free trial ends on ${dateFormat.format(access.endsAt)}.`
            ) : (
              "Choose a plan to keep using Shiru."
            )}
          </CardDescription>
        </CardHeader>
        <CardPanel>
          {access && (
            <Badge
              variant={
                access.kind === "subscription"
                  ? "success"
                  : access.kind === "trial"
                    ? "info"
                    : "warning"
              }
            >
              {accessLabel(access)}
            </Badge>
          )}
        </CardPanel>
        <CardFooter className="justify-end">
          {access?.kind === "subscription" ? (
            <Button variant="outline" loading={portal.isPending} onClick={() => portal.mutate()}>
              Manage subscription
            </Button>
          ) : (
            <Button
              disabled={!access}
              loading={checkout.isPending}
              onClick={() => checkout.mutate()}
            >
              Upgrade
            </Button>
          )}
        </CardFooter>
      </Card>
    </Page>
  );
}
