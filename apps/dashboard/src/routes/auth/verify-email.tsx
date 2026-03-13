import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
  IconAlertWarningOutlineDuo18,
  IconEnvelopeArrowRightOutlineDuo18,
  IconEnvelopeCheckOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useEffect, useState } from "react";
import { z } from "zod";
import Loader from "@/components/loader";
import { Button } from "@shiru/ui/button";
import { authClient } from "@/utils/auth-client";
import { toastManager } from "@shiru/ui/toast";

const verifyEmailSearchSchema = z.object({
  token: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/auth/verify-email")({
  component: VerifyEmailRoute,
  validateSearch: zodValidator(verifyEmailSearchSchema),
});

function VerifyEmailRoute() {
  const navigate = useNavigate();
  const { token, error } = useSearch({ from: "/auth/verify-email" });
  const [status, setStatus] = useState<"loading" | "success" | "error" | "missing">("loading");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (error === "INVALID_TOKEN" || error === "invalid_token") {
      setStatus("error");
      return;
    }

    if (!token) {
      setStatus("missing");
      return;
    }

    const verifyToken = async () => {
      const { error: verifyError } = await authClient.verifyEmail({
        query: { token },
      });

      if (verifyError) {
        setStatus("error");
        toastManager.add({
          title: verifyError.message || "Verification failed",
          type: "error",
        });
      } else {
        setStatus("success");
        toastManager.add({
          title: "Email verified successfully!",
          type: "success",
        });
      }
    };

    verifyToken();
  }, [token, error]);

  const handleResendVerification = async () => {
    const session = await authClient.getSession();
    if (!session.data?.user?.email) {
      toastManager.add({
        title: "Please sign in to resend verification email",
        type: "error",
      });
      navigate({ to: "/auth/signin" });
      return;
    }

    setResending(true);
    const { error: sendError } = await authClient.sendVerificationEmail({
      email: session.data.user.email,
      callbackURL: "/auth/verify-email",
    });

    if (sendError) {
      toastManager.add({
        title: sendError.message || "Failed to send verification email",
        type: "error",
      });
    } else {
      toastManager.add({
        title: "Verification email sent",
        description: "Check your inbox for the verification link",
        type: "success",
      });
    }
    setResending(false);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center py-4">
        <Loader />
        <p className="mt-4 text-sm text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-success/10">
          <IconEnvelopeCheckOutlineDuo18 className="size-5 text-success-foreground" />
        </div>
        <h1 className="font-heading text-xl text-foreground">Email verified</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your email has been verified. You now have full access to your account.
        </p>

        <Button className="mt-6 w-full" onClick={() => navigate({ to: "/" })}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <IconAlertWarningOutlineDuo18 className="size-5 text-destructive-foreground" />
        </div>
        <h1 className="font-heading text-xl text-foreground">Verification failed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This verification link is invalid or has expired. Request a new one below.
        </p>

        <div className="mt-6 w-full space-y-2">
          <Button className="w-full" disabled={resending} onClick={handleResendVerification}>
            {resending ? "Sending..." : "Resend verification email"}
          </Button>
          <Button
            className="w-full"
            variant="ghost"
            onClick={() => navigate({ to: "/auth/signin" })}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  // Missing token
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <IconEnvelopeArrowRightOutlineDuo18 className="size-5 text-muted-foreground" />
      </div>
      <h1 className="font-heading text-xl text-foreground">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Check your inbox for the verification link. If you haven't received it, request a new one.
      </p>

      <div className="mt-6 w-full space-y-2">
        <Button className="w-full" disabled={resending} onClick={handleResendVerification}>
          {resending ? "Sending..." : "Resend verification email"}
        </Button>
        <Button render={<Link to="/auth/signin" />} className="w-full" variant="ghost">
          Back to sign in
        </Button>
      </div>
    </div>
  );
}
