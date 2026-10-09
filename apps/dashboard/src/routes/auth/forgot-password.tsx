import { Button } from "@shiru/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@shiru/ui/components/card";
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
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { IconEnvelopeCheckOutlineDuo18 } from "nucleo-ui-outline-duo-18";

import { authClient } from "@/lib/auth-client";
import { callbackURL } from "@/lib/redirect";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const requestReset = useMutation({
    mutationFn: (email: string) =>
      authClient.requestPasswordReset({ email, redirectTo: callbackURL("/auth/reset-password") }),
  });

  if (requestReset.isSuccess) {
    return (
      <Card>
        <Empty className="md:py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconEnvelopeCheckOutlineDuo18 />
            </EmptyMedia>
            <EmptyTitle>Check your inbox</EmptyTitle>
            <EmptyDescription>
              If an account exists for{" "}
              <strong className="text-foreground">{requestReset.variables}</strong>, you'll get a
              link to reset your password.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" className="w-full" onClick={() => requestReset.reset()}>
              Use a different email
            </Button>
            <Button variant="ghost" className="w-full" render={<Link to="/auth/sign-in" />}>
              Back to sign in
            </Button>
          </EmptyContent>
        </Empty>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>Enter your email and we'll send you a reset link.</CardDescription>
      </CardHeader>
      <CardPanel>
        <Form
          className="flex flex-col gap-4"
          onFormSubmit={(values) => requestReset.mutate(values.email as string)}
        >
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" autoComplete="email" placeholder="you@example.com" required />
            <FieldError />
          </Field>
          <Button type="submit" className="w-full" loading={requestReset.isPending}>
            Send reset link
          </Button>
        </Form>
      </CardPanel>
      <CardFooter className="justify-center text-muted-foreground text-sm">
        <p>
          Remember your password?{" "}
          <Link to="/auth/sign-in" className="font-medium text-foreground">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
