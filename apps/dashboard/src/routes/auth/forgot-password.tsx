import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";
import { Button } from "@shiru/ui/button";
import { Field, FieldError, FieldLabel } from "@shiru/ui/field";
import { Input } from "@shiru/ui/input";
import { authClient } from "@/utils/auth-client";
import { toastManager } from "@shiru/ui/toast";

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
      <>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="mb-2 font-bold text-3xl text-foreground">Check Your Email</h1>
          <p className="text-muted-foreground">
            We've sent a password reset link to your email address. Please check your inbox and
            follow the instructions.
          </p>
        </div>

        <div className="space-y-4">
          <Button className="w-full" onClick={() => setEmailSent(false)} variant="outline">
            Send Another Link
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
      <h1 className="mb-2 text-center font-bold text-3xl text-foreground">Forgot Password?</h1>
      <p className="mb-6 text-center text-muted-foreground">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div>
          <form.Field name="email">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FieldError key={error?.message}>{error?.message}</FieldError>
                ))}
              </Field>
            )}
          </form.Field>
        </div>

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

      <div className="mt-4 text-center">
        <Button render={<Link to="/auth/signin" />} variant="link">
          Back to Sign In
        </Button>
      </div>
    </>
  );
}
