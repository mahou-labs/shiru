import { Button } from "@shiru/ui/components/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@shiru/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shiru/ui/components/empty";
import { Field, FieldError, FieldLabel } from "@shiru/ui/components/field";
import { Form } from "@shiru/ui/components/form";
import { Input } from "@shiru/ui/components/input";
import { toastManager } from "@shiru/ui/components/toast";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { IconAlertWarningOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: z.object({
    token: z.string().optional().catch(undefined),
    error: z.string().optional().catch(undefined),
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token, error } = Route.useSearch();
  const navigate = useNavigate();

  const reset = useMutation({
    mutationFn: (newPassword: string) => authClient.resetPassword({ newPassword, token }),
    onSuccess: async () => {
      toastManager.add({ type: "success", title: "Password updated. Sign in to continue." });
      await navigate({ to: "/auth/sign-in" });
    },
  });

  if (!token || error) {
    return (
      <Card>
        <Empty className="md:py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconAlertWarningOutlineDuo18 />
            </EmptyMedia>
            <EmptyTitle>This link doesn't work</EmptyTitle>
            <EmptyDescription>
              Reset links expire after an hour and work once. Request a new one.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button className="w-full" render={<Link to="/auth/forgot-password" />}>
              Request a new link
            </Button>
          </EmptyContent>
        </Empty>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>You'll use it the next time you sign in.</CardDescription>
      </CardHeader>
      <CardPanel>
        <Form
          className="flex flex-col gap-4"
          onFormSubmit={(values) => reset.mutate(values.password as string)}
        >
          <Field name="password">
            <FieldLabel>New password</FieldLabel>
            <Input type="password" autoComplete="new-password" required minLength={8} />
            <FieldError />
          </Field>
          <Field
            name="confirm"
            validate={(value, values) =>
              value === values.password ? null : "Passwords don't match"
            }
          >
            <FieldLabel>Confirm password</FieldLabel>
            <Input type="password" autoComplete="new-password" required />
            <FieldError />
          </Field>
          <Button type="submit" className="w-full" loading={reset.isPending}>
            Update password
          </Button>
        </Form>
      </CardPanel>
    </Card>
  );
}
