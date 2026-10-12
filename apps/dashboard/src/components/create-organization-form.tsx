import { Button } from "@shiru/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/components/field";
import { Form } from "@shiru/ui/components/form";
import { Input } from "@shiru/ui/components/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useSlugAvailability(slug: string) {
  const valid = slug.length >= 3 && SLUG_PATTERN.test(slug);
  const debouncedSlug = useDebouncedValue(slug, 400);
  const settled = valid && slug === debouncedSlug;

  const { data: available } = useQuery({
    queryKey: ["organization-slug-available", debouncedSlug],
    queryFn: async () => {
      try {
        await authClient.organization.checkSlug({ slug: debouncedSlug });
        return true;
      } catch (error) {
        if (
          (error as { error?: { code?: string } }).error?.code === "ORGANIZATION_SLUG_ALREADY_TAKEN"
        ) {
          return false;
        }
        throw error;
      }
    },
    enabled: settled,
    staleTime: 30_000,
    meta: { silent: true },
  });

  if (!valid) return "invalid";
  if (!settled || available === undefined) return "checking";
  return available ? "available" : "taken";
}

export function CreateOrganizationForm({ onCreated }: { onCreated?: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slugInput, setSlugInput] = useState<string>();
  const slug = slugInput ?? slugify(name);
  const availability = useSlugAvailability(slug);

  const create = useMutation({
    mutationFn: async (input: { name: string; slug: string }) => {
      const organization = await authClient.organization.create(input);
      await authClient.organization.setActive({ organizationId: organization.id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      onCreated?.();
      await navigate({ to: "/" });
    },
  });

  return (
    <Form
      className="flex flex-col gap-4"
      onFormSubmit={(values) => create.mutate(values as { name: string; slug: string })}
    >
      <Field name="name">
        <FieldLabel>Organization name</FieldLabel>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Acme"
          autoComplete="organization"
          required
        />
        <FieldError />
      </Field>
      <Field name="slug" invalid={availability === "taken" || undefined}>
        <FieldLabel>Slug</FieldLabel>
        <Input
          value={slug}
          onChange={(event) => setSlugInput(event.target.value)}
          placeholder="acme"
          required
          minLength={3}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
        {availability === "taken" ? (
          <FieldError match>That slug is already taken.</FieldError>
        ) : availability === "available" ? (
          <FieldDescription className="text-success-foreground">
            {slug} is available.
          </FieldDescription>
        ) : availability === "checking" ? (
          <FieldDescription>Checking availability…</FieldDescription>
        ) : (
          <FieldDescription>Lowercase letters, numbers, and single hyphens.</FieldDescription>
        )}
        {availability !== "taken" && <FieldError />}
      </Field>
      <Button
        type="submit"
        className="w-full"
        loading={create.isPending}
        disabled={availability !== "available"}
      >
        Create organization
      </Button>
    </Form>
  );
}
