import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
  IconAlertWarningOutlineDuo18,
  IconCircleWarningOutlineDuo18,
  IconShieldKeyholeOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
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

  // Invalid or expired token
  if (error === "INVALID_TOKEN" || error === "invalid_token") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <IconAlertWarningOutlineDuo18 className="size-5 text-destructive-foreground" />
        </div>
        <h1 className="font-heading text-xl text-foreground">Invalid or expired link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This password reset link is no longer valid. Please request a new one.
        </p>

        <div className="mt-6 w-full space-y-2">
          <Button className="w-full" onClick={() => navigate({ to: "/auth/forgot-password" })}>
            Request new link
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

  // Success state
  if (resetSuccess) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-success/10">
          <IconShieldKeyholeOutlineDuo18 className="size-5 text-success-foreground" />
        </div>
        <h1 className="font-heading text-xl text-foreground">Password reset</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your password has been updated. You can now sign in with your new password.
        </p>

        <Button className="mt-6 w-full" onClick={() => navigate({ to: "/auth/signin" })}>
          Sign in
        </Button>
      </div>
    );
  }

  // Missing token
  if (!token) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-warning/10">
          <IconCircleWarningOutlineDuo18 className="size-5 text-warning-foreground" />
        </div>
        <h1 className="font-heading text-xl text-foreground">Missing reset token</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No reset token was provided. Use the link from your email or request a new one.
        </p>

        <div className="mt-6 w-full space-y-2">
          <Button className="w-full" onClick={() => navigate({ to: "/auth/forgot-password" })}>
            Request password reset
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
        <h1 className="font-heading text-xl text-foreground">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field name="password">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>New password</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                placeholder="secretpass"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="password"
                value={field.state.value}
              />
              {field.state.meta.errors.map((error) => (
                <FieldError key={error?.message}>{error?.message}</FieldError>
              ))}
            </Field>
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                placeholder="secretpass"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="password"
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
              {state.isSubmitting ? "Resetting..." : "Reset Password"}
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
