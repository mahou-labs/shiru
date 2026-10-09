import { Button } from "@shiru/ui/components/button";
import { Card } from "@shiru/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shiru/ui/components/empty";
import { Spinner } from "@shiru/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { IconAlertWarningOutlineDuo18, IconUsersOutlineDuo18 } from "nucleo-ui-outline-duo-18";

import { authClient } from "@/lib/auth-client";
import { invitationQuery, sessionQuery } from "@/lib/queries";

export const Route = createFileRoute("/invite/$id")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.fetchQuery(sessionQuery);
    if (!session) throw redirect({ to: "/auth/sign-up", search: { redirect: location.href } });
    return { session };
  },
  component: Invite,
});

function Invite() {
  const { id } = Route.useParams();
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invitation = useQuery(invitationQuery(id));

  const accept = useMutation({
    mutationFn: async () => {
      const { member } = await authClient.organization.acceptInvitation({ invitationId: id });
      await authClient.organization.setActive({ organizationId: member.organizationId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "invitation",
      });
      await navigate({ to: "/" });
    },
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-sidebar p-4">
      <p className="font-heading font-semibold text-lg">Shiru</p>
      <Card className="w-full max-w-sm">
        {invitation.isPending ? (
          <Empty>
            <Spinner />
          </Empty>
        ) : invitation.data ? (
          <Empty className="md:py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconUsersOutlineDuo18 />
              </EmptyMedia>
              <EmptyTitle>Join {invitation.data.organizationName}</EmptyTitle>
              <EmptyDescription>
                {invitation.data.inviterEmail} invited you to join{" "}
                {invitation.data.organizationName}.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button className="w-full" loading={accept.isPending} onClick={() => accept.mutate()}>
                Accept invitation
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Empty className="md:py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconAlertWarningOutlineDuo18 />
              </EmptyMedia>
              <EmptyTitle>Invitation not available</EmptyTitle>
              <EmptyDescription>
                It may have expired or been sent to a different address than{" "}
                <strong className="text-foreground">{session.user.email}</strong>.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" className="w-full" render={<Link to="/" />}>
                Go to dashboard
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </Card>
    </div>
  );
}
