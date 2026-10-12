import { Button } from "@shiru/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@shiru/ui/components/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/components/field";
import { Form } from "@shiru/ui/components/form";
import { Input } from "@shiru/ui/components/input";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { callbackURL } from "@/lib/redirect";

export const Route = createFileRoute("/auth/sign-up")({
  component: SignUp,
});

type NewAccount = { name: string; email: string; password: string };

function SignUp() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();

  const signUp = useMutation({
    mutationFn: (account: NewAccount) =>
      authClient.signUp.email({ ...account, callbackURL: callbackURL(redirect) }),
    onSuccess: (_, { email }) =>
      navigate({ to: "/auth/verify-email", search: { email, sent: true, redirect } }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start your 30-day free trial.</CardDescription>
      </CardHeader>
      <CardPanel>
        <Form
          className="flex flex-col gap-4"
          onFormSubmit={(values) => signUp.mutate(values as NewAccount)}
        >
          <Field name="name">
            <FieldLabel>Name</FieldLabel>
            <Input autoComplete="name" placeholder="Ada Lovelace" required minLength={2} />
            <FieldError />
          </Field>
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" autoComplete="email" placeholder="you@example.com" required />
            <FieldError />
          </Field>
          <Field name="password">
            <FieldLabel>Password</FieldLabel>
            <Input type="password" autoComplete="new-password" required minLength={8} />
            <FieldDescription>At least 8 characters.</FieldDescription>
            <FieldError />
          </Field>
          <Button type="submit" className="w-full" loading={signUp.isPending}>
            Create account
          </Button>
        </Form>
      </CardPanel>
      <CardFooter className="justify-center text-muted-foreground text-sm">
        <p>
          Already have an account?{" "}
          <Link to="/auth/sign-in" search={{ redirect }} className="font-medium text-foreground">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
