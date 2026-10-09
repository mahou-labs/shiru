import { Button } from "@shiru/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/components/field";
import { Form } from "@shiru/ui/components/form";
import { Input } from "@shiru/ui/components/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateOrganizationForm({ onCreated }: { onCreated?: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState<string>();

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
      <Field name="slug">
        <FieldLabel>Slug</FieldLabel>
        <Input
          value={slug ?? slugify(name)}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="acme"
          required
          minLength={3}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
        <FieldDescription>Lowercase letters, numbers, and single hyphens.</FieldDescription>
        <FieldError />
      </Field>
      <Button type="submit" className="w-full" loading={create.isPending}>
        Create organization
      </Button>
    </Form>
  );
}
