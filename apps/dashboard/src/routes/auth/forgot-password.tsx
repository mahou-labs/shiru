import { Button } from "@shiru/ui/button";
import { Field, FieldError, FieldLabel } from "@shiru/ui/field";
import { Input } from "@shiru/ui/input";
import { toastManager } from "@shiru/ui/toast";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { IconEnvelopeCheckOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { useState } from "react";
import z from "zod";

import { authClient } from "@/utils/auth-client";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordRoute,
});

function ForgotPasswordRoute() {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: "/auth/reset-password",
      });

      if (error) {
        toastManager.add({
          title: error.message || "Failed to send reset email",
          type: "error",
        });
        return;
      }

      setEmailSent(true);
      toastManager.add({
        title: "Reset link sent",
        description: "Check your email for the password reset link",
        type: "success",
      });
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
      }),
    },
  });

  if (emailSent) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-success/10">
          <IconEnvelopeCheckOutlineDuo18 className="size-5 text-success-foreground" />
        </div>
        <h1 className="font-heading text-xl text-foreground">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We've sent a password reset link to your email address. Check your inbox and follow the
          instructions.
        </p>

        <div className="mt-6 w-full space-y-2">
          <Button className="w-full" variant="outline" onClick={() => setEmailSent(false)}>
            Send another link
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

  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-xl text-foreground">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="email">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="name@example.com"
                type="email"
                value={field.state.value}
              />
              {field.state.meta.errors.map((error) => (
                <FieldError key={error?.message}>{error?.message}</FieldError>
              ))}
            </Field>
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <Button
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
              type="submit"
            >
              {state.isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          to="/auth/signin"
          className="font-medium text-foreground transition-colors hover:text-foreground/80"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
