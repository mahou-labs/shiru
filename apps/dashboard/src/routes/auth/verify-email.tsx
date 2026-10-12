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
import { useEffect, useState } from "react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { callbackURL } from "@/lib/redirect";

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: z.object({
    email: z.email().optional().catch(undefined),
    // Set when the page opens right after sign-up, which already sent an email.
    sent: z.boolean().optional().catch(undefined),
  }),
  component: VerifyEmail,
});

const RESEND_COOLDOWN_SECONDS = 60;

function useCountdown(initialSeconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + initialSeconds * 1000);
  const [now, setNow] = useState(Date.now);
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const running = remaining > 0;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  return {
    remaining,
    start(seconds: number) {
      setNow(Date.now());
      setEndsAt(Date.now() + seconds * 1000);
    },
  };
}

function VerifyEmail() {
  const { email, sent, redirect } = Route.useSearch();
  const cooldown = useCountdown(sent ? RESEND_COOLDOWN_SECONDS : 0);

  const resend = useMutation({
    mutationFn: (email: string) =>
      authClient.sendVerificationEmail({ email, callbackURL: callbackURL(redirect) }),
    onSuccess: () => {
      cooldown.start(RESEND_COOLDOWN_SECONDS);
      toastManager.add({ type: "success", title: "Verification email sent" });
    },
    onError: (error) => {
      const retryAfter = (error as { error?: { retryAfter?: number } }).error?.retryAfter;
      if (retryAfter) cooldown.start(retryAfter);
    },
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
              disabled={cooldown.remaining > 0}
              onClick={() => resend.mutate(email)}
            >
              {cooldown.remaining > 0 ? `Resend email in ${cooldown.remaining}s` : "Resend email"}
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
