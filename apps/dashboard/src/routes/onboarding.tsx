import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { z } from "zod";
import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/field";
import { Input } from "@shiru/ui/input";
import { orpc } from "@/utils/orpc-client";
import { toastManager } from "@shiru/ui/toast";

const onboardingSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z
    .string()
    .trim() // ignore accidental leading/trailing spaces
    .min(4, "Slug must be at least 4 characters.")
    .regex(/^[a-z0-9-]+$/, "Use only lowercase letters, numbers, and hyphens.")
    .refine((s) => !(s.startsWith("-") || s.endsWith("-")), {
      message: "Slug cannot start or end with a hyphen.",
    })
    .refine((s) => !s.includes("--"), {
      message: "Slug cannot contain consecutive hyphens.",
    }),
});

export const Route = createFileRoute("/onboarding")({
  component: OnboardingComponent,
  beforeLoad: ({ context }) => {
    if (context.session?.activeOrganizationId) {
      throw redirect({ to: "/" });
    }
  },
});

function OnboardingComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync: createOrg } = useMutation(orpc.organization.createOrg.mutationOptions());

  const form = useForm({
    defaultValues: { name: "", slug: "" },
    validators: { onSubmit: onboardingSchema },
    onSubmit: async ({ value }) => {
      const org = await createOrg({
        name: value.name.trim(),
        slug: value.slug.trim(),
      });

      if (org) {
        toastManager.add({
          title: "Organization created successfully!",
          type: "success",
        });
        await queryClient.fetchQuery(orpc.user.getSession.queryOptions());
        navigate({ to: "/" });
      } else {
        toastManager.add({
          title: "Failed to create organization",
          type: "error",
        });
      }
    },
  });

  const slug = useStore(form.store, (state) => state.values.slug);
  const isSlugValid = onboardingSchema.shape.slug.safeParse(slug).success;
  const debouncedSlug = useDebounce(isSlugValid ? slug : "", 500);

  const { data: slugAvailable, isLoading } = useQuery(
    orpc.organization.checkSlugAvailability.queryOptions({
      input: debouncedSlug,
      enabled: isSlugValid && slug === debouncedSlug,
    }),
  );

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Shiru!</CardTitle>
          <CardDescription>Let's get you started by creating your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel>Organization Name</FieldLabel>
                  <Input
                    disabled={form.state.isSubmitting}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter your organization name"
                    value={field.state.value}
                  />
                  {field.state.meta.errors.map((error) => (
                    <FieldError key={error?.message}>{error?.message}</FieldError>
                  ))}
                </Field>
              )}
            </form.Field>

            <form.Field
              name="slug"
              validators={{
                onChange: onboardingSchema.shape.slug,
              }}
            >
              {(field) => {
                const isTyping = field.state.value !== debouncedSlug;

                return (
                  <Field>
                    <FieldLabel>Organization Slug</FieldLabel>
                    <Input
                      disabled={form.state.isSubmitting}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="your-organization-slug"
                      value={field.state.value}
                    />
                    {field.state.meta.errors.map((error) => (
                      <FieldError key={error?.message}>{error?.message}</FieldError>
                    ))}
                    {field.state.meta.errors.length === 0 && field.state.value && (
                      <FieldDescription>
                        {isTyping || isLoading
                          ? "Checking availability..."
                          : slugAvailable
                            ? "✓ Available"
                            : "✗ Taken"}
                      </FieldDescription>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <Button
              className="w-full"
              disabled={
                !form.state.canSubmit ||
                form.state.isSubmitting ||
                slug !== debouncedSlug ||
                (debouncedSlug.length >= 4 && isLoading) ||
                !slugAvailable
              }
              type="submit"
            >
              {form.state.isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
