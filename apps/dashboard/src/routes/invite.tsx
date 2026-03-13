import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Button } from "@shiru/ui/button";
import { orpc } from "@/utils/orpc-client";
import { toastManager } from "@shiru/ui/toast";

const inviteSearchSchema = z.object({
  id: z.string(),
});

export const Route = createFileRoute("/invite")({
  component: RouteComponent,
  validateSearch: zodValidator(inviteSearchSchema),
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({
        to: "/auth/signin",
        search: { redirect: location.href },
      });
    }
  },
});

function RouteComponent() {
  const { id } = Route.useSearch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync: acceptInvitation, isPending } = useMutation(
    orpc.orgInvite.accept.mutationOptions(),
  );

  const handleInvitationAccept = async () => {
    await acceptInvitation({ id });
    toastManager.add({ title: "Invitation accepted", type: "success" });
    await queryClient.fetchQuery(orpc.user.getSession.queryOptions());
    await navigate({ to: "/" });
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-2">
      <h1>Confirm joining ...</h1>
      <Button disabled={isPending} onClick={handleInvitationAccept}>
        Accept Invitation
      </Button>
    </div>
  );
}
