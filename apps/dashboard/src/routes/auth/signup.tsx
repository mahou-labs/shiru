import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import z from "zod";
import { Button } from "@shiru/ui/button";
import { Field, FieldError, FieldLabel } from "@shiru/ui/field";
import { Input } from "@shiru/ui/input";
import { authClient } from "@/utils/auth-client";
import { orpc } from "@/utils/orpc-client";
import { toastManager } from "@shiru/ui/toast";

export const Route = createFileRoute("/auth/signup")({
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
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(value, {
        onSuccess: async () => {
          toastManager.add({ title: "Sign up successful", type: "success" });
          await queryClient.fetchQuery(orpc.user.getSession.queryOptions());
          await navigate({ to: redirect ?? "/" });
        },
        onError: (error) => {
          toastManager.add({
            title: error.error.message || error.error.statusText,
            type: "error",
          });
        },
      });
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  return (
    <>
      <h1 className="font-bold text-2xl text-foreground">Create an account</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Enter your details to get started.</p>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
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
          <form.Field name="email">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
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
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
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
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
              type="submit"
            >
              {state.isSubmitting ? "Submitting..." : "Sign Up"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/auth/signin"
          search={{ redirect }}
          className="text-foreground underline underline-offset-4 hover:text-foreground/80"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
