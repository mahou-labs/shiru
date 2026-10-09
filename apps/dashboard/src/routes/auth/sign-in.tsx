import { Button } from "@shiru/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@shiru/ui/components/card";
import { Field, FieldError, FieldLabel } from "@shiru/ui/components/field";
import { Form } from "@shiru/ui/components/form";
import { Input } from "@shiru/ui/components/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { sessionQuery } from "@/lib/queries";

export const Route = createFileRoute("/auth/sign-in")({
  component: SignIn,
});

type Credentials = { email: string; password: string };

function SignIn() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signIn = useMutation({
    mutationFn: (credentials: Credentials) => authClient.signIn.email(credentials),
    onSuccess: async () => {
      await queryClient.invalidateQueries(sessionQuery);
      await navigate({ href: redirect ?? "/" });
    },
    onError: (error, { email }) => {
      if ((error as { error?: { code?: string } }).error?.code === "EMAIL_NOT_VERIFIED") {
        void navigate({ to: "/auth/verify-email", search: { email, redirect } });
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
      </CardHeader>
      <CardPanel>
        <Form
          className="flex flex-col gap-4"
          onFormSubmit={(values) => signIn.mutate(values as Credentials)}
        >
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" autoComplete="email" placeholder="you@example.com" required />
            <FieldError />
          </Field>
          <Field name="password">
            <div className="flex w-full items-center justify-between">
              <FieldLabel>Password</FieldLabel>
              <Link
                to="/auth/forgot-password"
                className="text-muted-foreground text-xs hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <Input type="password" autoComplete="current-password" required />
            <FieldError />
          </Field>
          <Button type="submit" className="w-full" loading={signIn.isPending}>
            Sign in
          </Button>
        </Form>
      </CardPanel>
      <CardFooter className="justify-center text-muted-foreground text-sm">
        <p>
          Don't have an account?{" "}
          <Link to="/auth/sign-up" search={{ redirect }} className="font-medium text-foreground">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
