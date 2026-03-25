import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import z from "zod";
import { Button } from "@shiru/ui/button";
import { Checkbox } from "@shiru/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@shiru/ui/field";
import { Input } from "@shiru/ui/input";
import { authClient } from "@/utils/auth-client";
import { orpc } from "@/utils/orpc-client";
import { toastManager } from "@shiru/ui/toast";

export const Route = createFileRoute("/auth/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
        },
        {
          onSuccess: async () => {
            toastManager.add({ title: "Sign in successful", type: "success" });
            const session = await queryClient.fetchQuery(orpc.user.getSession.queryOptions());
            // If user has no active org (and backend couldn't resolve one), send to onboarding
            const destination =
              redirect ?? (session?.session.activeOrganizationId ? "/" : "/onboarding");
            await navigate({ to: destination });
          },
          onError: (error) => {
            toastManager.add({
              title: error.error.message || error.error.statusText,
              type: "error",
            });
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        rememberMe: z.boolean(),
      }),
    },
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-xl text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue.</p>
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
                placeholder="name@example.com"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="email"
                value={field.state.value}
              />
              {field.state.meta.errors.map((error) => (
                <FieldError key={error?.message}>{error?.message}</FieldError>
              ))}
            </Field>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Field>
              <div className="flex items-center justify-between gap-4">
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
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

        <form.Field name="rememberMe">
          {(field) => (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={field.state.value}
                id={field.name}
                name={field.name}
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <Button
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
              type="submit"
            >
              {state.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/auth/signup"
          search={{ redirect }}
          className="font-medium text-foreground transition-colors hover:text-foreground/80"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
