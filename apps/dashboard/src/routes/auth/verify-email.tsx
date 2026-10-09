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
import { toastManager } from "@shiru/ui/components/toast";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { IconEnvelopeArrowRightOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { callbackURL } from "@/lib/redirect";

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: z.object({ email: z.email().optional().catch(undefined) }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const { email, redirect } = Route.useSearch();

  const resend = useMutation({
    mutationFn: (email: string) =>
      authClient.sendVerificationEmail({ email, callbackURL: callbackURL(redirect) }),
    onSuccess: () => toastManager.add({ type: "success", title: "Verification email sent" }),
  });

  return (
    <Card>
      <Empty className="md:py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconEnvelopeArrowRightOutlineDuo18 />
          </EmptyMedia>
          <EmptyTitle>Check your inbox</EmptyTitle>
          <EmptyDescription>
            {email ? (
              <>
                We sent a verification link to <strong className="text-foreground">{email}</strong>.
              </>
            ) : (
              "We sent you a verification link."
            )}{" "}
            Open it to finish setting up your account.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {email && (
            <Button
              variant="outline"
              className="w-full"
              loading={resend.isPending}
              onClick={() => resend.mutate(email)}
            >
              Resend email
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full"
            render={<Link to="/auth/sign-in" search={{ redirect }} />}
          >
            Back to sign in
          </Button>
        </EmptyContent>
      </Empty>
    </Card>
  );
}
