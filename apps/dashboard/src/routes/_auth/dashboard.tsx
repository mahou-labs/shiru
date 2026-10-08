import { Button } from "@shiru/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const organizationId = session.data?.session.activeOrganizationId;

  const privateData = useQuery(orpc.privateData.queryOptions());
  const access = useQuery({ ...orpc.subscription.queryOptions(), enabled: !!organizationId });

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.data?.user.name}</p>
      <p>API: {privateData.data?.message}</p>
      {!organizationId ? (
        <p>Create an organization to start your trial.</p>
      ) : access.data?.kind === "subscription" ? (
        <Button onClick={async () => await authClient.customer.portal()}>
          Manage subscription
        </Button>
      ) : (
        <>
          <p>
            {access.data?.kind === "trial"
              ? `Trial ends ${access.data.endsAt.toLocaleDateString()}`
              : "Your trial has ended"}
          </p>
          <Button
            onClick={async () =>
              await authClient.checkout({ slug: "starter-monthly", referenceId: organizationId })
            }
          >
            Upgrade
          </Button>
        </>
      )}
    </div>
  );
}
