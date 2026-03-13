import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@shiru/ui/button";
import { Field, FieldError, FieldLabel } from "@shiru/ui/field";
import { Input } from "@shiru/ui/input";
import { authClient } from "@/utils/auth-client";
import { toastManager } from "@shiru/ui/toast";

const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordRoute,
  validateSearch: zodValidator(resetPasswordSearchSchema),
});

function ResetPasswordRoute() {
  const navigate = useNavigate();
  const { token, error } = useSearch({ from: "/auth/reset-password" });
  const [resetSuccess, setResetSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toastManager.add({
          title: "Invalid or missing reset token",
          type: "error",
        });
        return;
      }

      await authClient.resetPassword(
        {
          newPassword: value.password,
          token,
        },
        {
          onSuccess: () => {
            setResetSuccess(true);
            toastManager.add({
              title: "Password reset successful",
              description: "You can now sign in with your new password",
              type: "success",
            });
          },
          onError: (error) => {
            toastManager.add({
              title: error.error.message || "Failed to reset password",
              type: "error",
            });
          },
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must be at most 128 characters"),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    },
  });

  // Show error state if token is invalid
  if (error === "INVALID_TOKEN" || error === "invalid_token") {
    return (
      <>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="mb-2 font-bold text-3xl text-foreground">Invalid or Expired Link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>

        <div className="space-y-4">
          <Button className="w-full" onClick={() => navigate({ to: "/auth/forgot-password" })}>
            Request New Link
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

  // Show success state after password reset
  if (resetSuccess) {
    return (
      <>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="mb-2 font-bold text-3xl text-foreground">Password Reset!</h1>
          <p className="text-muted-foreground">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>

        <Button className="w-full" onClick={() => navigate({ to: "/auth/signin" })}>
          Sign In
        </Button>
      </>
    );
  }

  // Show error if no token provided
  if (!token) {
    return (
      <>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <span className="text-2xl">🔗</span>
          </div>
          <h1 className="mb-2 font-bold text-3xl text-foreground">Missing Reset Token</h1>
          <p className="text-muted-foreground">
            No password reset token was provided. Please use the link from your email or request a
            new one.
          </p>
        </div>

        <div className="space-y-4">
          <Button className="w-full" onClick={() => navigate({ to: "/auth/forgot-password" })}>
            Request Password Reset
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
      <h1 className="mb-2 text-center font-bold text-3xl text-foreground">Reset Your Password</h1>
      <p className="mb-6 text-center text-muted-foreground">Enter your new password below.</p>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div>
          <form.Field name="password">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your new password"
                  type="password"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FieldError key={error?.message}>{error?.message}</FieldError>
                ))}
              </Field>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="confirmPassword">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Confirm your new password"
                  type="password"
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
              {state.isSubmitting ? "Resetting..." : "Reset Password"}
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
