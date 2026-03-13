import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
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
    // Handle error from URL
    if (error === "INVALID_TOKEN" || error === "invalid_token") {
      setStatus("error");
      return;
    }

    // Handle missing token
    if (!token) {
      setStatus("missing");
      return;
    }

    // Verify the token
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
      <div className="flex flex-col items-center justify-center">
        <Loader />
        <p className="mt-4 text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="mb-2 font-bold text-3xl text-foreground">Email Verified!</h1>
          <p className="text-muted-foreground">
            Your email has been successfully verified. You can now access all features of your
            account.
          </p>
        </div>

        <Button className="w-full" onClick={() => navigate({ to: "/" })}>
          Go to Dashboard
        </Button>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="mb-2 font-bold text-3xl text-foreground">Verification Failed</h1>
          <p className="text-muted-foreground">
            This verification link is invalid or has expired. Please request a new verification
            email.
          </p>
        </div>

        <div className="space-y-4">
          <Button className="w-full" disabled={resending} onClick={handleResendVerification}>
            {resending ? "Sending..." : "Resend Verification Email"}
          </Button>
          <Button
            className="w-full"
            onClick={() => navigate({ to: "/auth/signin" })}
            variant="ghost"
          >
            Back to Sign In
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <span className="text-2xl">✉️</span>
        </div>
        <h1 className="mb-2 font-bold text-3xl text-foreground">Verify Your Email</h1>
        <p className="text-muted-foreground">
          Please check your inbox for the verification link we sent you. If you haven't received it,
          you can request a new one.
        </p>
      </div>

      <div className="space-y-4">
        <Button className="w-full" disabled={resending} onClick={handleResendVerification}>
          {resending ? "Sending..." : "Resend Verification Email"}
        </Button>
        <Button render={<Link to="/auth/signin" />} className="w-full" variant="ghost">
          Back to Sign In
        </Button>
      </div>
    </>
  );
}
