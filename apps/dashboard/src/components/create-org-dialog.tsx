import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { IconCheckOutline18, IconXmarkOutline18 } from "nucleo-ui-outline-18";
import { z } from "zod";
import { orpc } from "@/utils/orpc-client";
import { Button } from "@shiru/ui/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@shiru/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/field";
import { Form } from "@shiru/ui/form";
import { Input } from "@shiru/ui/input";
import { toastManager } from "@shiru/ui/toast";

type CreateOrgDialogProps = {
  allowClosing?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

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

export function CreateOrgDialog({
  allowClosing = false,
  isOpen,
  onSuccess,
  onOpenChange,
}: CreateOrgDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

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

        await queryClient.invalidateQueries(orpc.organization.getOrgList.queryOptions());
        await queryClient.fetchQuery(orpc.user.getSession.queryOptions());
        await router.invalidate();
        form.reset();
        onSuccess();
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
    <Dialog disablePointerDismissal={!allowClosing} onOpenChange={onOpenChange} open={isOpen}>
      <DialogPopup className="sm:max-w-md" showCloseButton={allowClosing}>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create new organization</DialogTitle>
          </DialogHeader>
          <DialogPanel className="grid gap-4">
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
                        {isTyping || isLoading ? (
                          "Checking availability..."
                        ) : slugAvailable ? (
                          <span className="flex gap-1 text-success">
                            <IconCheckOutline18 className="size-4" /> Available
                          </span>
                        ) : (
                          <span className="flex gap-1 text-destructive">
                            <IconXmarkOutline18 className="size-4" /> Taken
                          </span>
                        )}
                      </FieldDescription>
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </DialogPanel>
          <DialogFooter>
            {allowClosing && (
              <DialogClose
                render={<Button disabled={form.state.isSubmitting} type="button" variant="ghost" />}
              >
                Cancel
              </DialogClose>
            )}
            <Button
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
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  );
}
