import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";
import { toastManager } from "@shiru/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { LoadingScreen } from "@/components/loading-screen";
import { orpc } from "@/utils/orpc-client";

const inviteSearchSchema = z.object({
  id: z.string(),
});

export const Route = createFileRoute("/invite")({
  component: InviteRoute,
  validateSearch: zodValidator(inviteSearchSchema),
});

function InviteRoute() {
  const { id } = Route.useSearch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: session, isPending: sessionPending } = useQuery(
    orpc.user.getSession.queryOptions({ staleTime: Infinity }),
  );

  const { mutateAsync: acceptInvitation, isPending } = useMutation(
    orpc.organization.acceptInvite.mutationOptions(),
  );

  if (sessionPending) return <LoadingScreen />;
  if (!session)
    return <Navigate to={`/auth/signin?redirect=${encodeURIComponent(`/invite?id=${id}`)}`} />;

  const handleInvitationAccept = async () => {
    await acceptInvitation({ id });
    toastManager.add({ title: "Invitation accepted", type: "success" });
    await queryClient.fetchQuery(orpc.user.getSession.queryOptions());
    await navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-sidebar p-4 sm:p-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-background)_0%,transparent_60%)]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <div className="mb-8">
          <p className="font-heading text-xl font-semibold text-foreground">Shiru</p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>You've been invited</CardTitle>
            <CardDescription>Accept this invitation to join the organization</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled={isPending} onClick={handleInvitationAccept}>
              {isPending ? "Accepting..." : "Accept Invitation"}
            </Button>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Mahou Labs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
