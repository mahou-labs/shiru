import { isDefinedError, type InferClientErrors } from "@orpc/client";
import { Alert, AlertDescription, AlertTitle } from "@shiru/ui/components/alert";
import { Button } from "@shiru/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/components/field";
import { Form } from "@shiru/ui/components/form";
import { Input } from "@shiru/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@shiru/ui/components/input-group";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { errorMessage } from "@/lib/errors";
import { slugify, useDebouncedValue } from "@/lib/slug";
import { orpc } from "@/utils/orpc";

import type { AppRouterClient } from "../../../api/src/routers";
import { SiteSlug } from "../../../api/src/sites/names";

type CreateSiteError = InferClientErrors<AppRouterClient>["sites"]["create"];

const MAX_SLUG_LENGTH = 40;

type Availability =
  | { kind: "invalid"; message?: string }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "taken" };

function useSlugAvailability(slug: string): Availability {
  const parsed = SiteSlug.safeParse(slug);
  const debouncedSlug = useDebouncedValue(slug, 400);
  const settled = parsed.success && slug === debouncedSlug;

  const { data } = useQuery({
    ...orpc.sites.checkSlug.queryOptions({ input: { slug: debouncedSlug } }),
    enabled: settled,
    staleTime: 30_000,
    meta: { silent: true },
  });

  if (!parsed.success) {
    return { kind: "invalid", message: slug ? parsed.error.issues[0]?.message : undefined };
  }
  if (!settled || data === undefined) return { kind: "checking" };
  return data.available ? { kind: "available" } : { kind: "taken" };
}

export function CreateSiteForm({ onCreated }: { onCreated: () => void }) {
  const queryClient = useQueryClient();
  const { data: domain } = useQuery(orpc.sites.docsDomain.queryOptions({ staleTime: Infinity }));
  const [name, setName] = useState("");
  const [slugInput, setSlugInput] = useState<string>();
  const slug = slugInput ?? slugify(name).slice(0, MAX_SLUG_LENGTH).replace(/-+$/, "");
  const availability = useSlugAvailability(slug);

  const create = useMutation({
    ...orpc.sites.create.mutationOptions(),
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orpc.sites.key() });
      onCreated();
    },
    onError: async (error) => {
      if (!isDefinedError(error)) return;
      if (error.code === "SLUG_TAKEN" || error.code === "PUBLIC_SITE_EXISTS") {
        await queryClient.invalidateQueries({ queryKey: orpc.sites.key() });
      }
    },
  });

  const error = create.error;
  const slugTaken =
    availability.kind === "taken" || (isDefinedError(error) && error.code === "SLUG_TAKEN");

  const invalidMessage = availability.kind === "invalid" ? availability.message : undefined;

  return (
    <Form
      className="flex flex-col gap-4"
      onFormSubmit={() => create.mutate({ name, slug, visibility: "public" })}
    >
      {error && !slugTaken && <SubmitError error={error} />}
      <Field name="name">
        <FieldLabel>Site name</FieldLabel>
        <Input
          value={name}
          onChange={(event) => {
            create.reset();
            setName(event.target.value);
          }}
          placeholder="Acme Docs"
          maxLength={100}
          required
        />
        <FieldError />
      </Field>
      <Field name="slug" invalid={slugTaken || invalidMessage ? true : undefined}>
        <FieldLabel>Address</FieldLabel>
        <InputGroup>
          <InputGroupInput
            value={slug}
            onChange={(event) => {
              create.reset();
              setSlugInput(event.target.value);
            }}
            placeholder="acme"
            maxLength={MAX_SLUG_LENGTH}
            required
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>.{domain}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        {slugTaken ? (
          <FieldError match>Another site already uses this address.</FieldError>
        ) : invalidMessage ? (
          <FieldError match>{invalidMessage}.</FieldError>
        ) : availability.kind === "available" ? (
          <FieldDescription className="text-success-foreground">
            {slug}.{domain} is available.
          </FieldDescription>
        ) : availability.kind === "checking" ? (
          <FieldDescription>Checking availability…</FieldDescription>
        ) : (
          <FieldDescription>Lowercase letters, numbers, and single hyphens.</FieldDescription>
        )}
      </Field>
      <Button
        type="submit"
        className="w-full"
        loading={create.isPending}
        disabled={availability.kind !== "available" || !name.trim()}
      >
        Create site
      </Button>
    </Form>
  );
}

function SubmitError({ error }: { error: CreateSiteError }) {
  if (!isDefinedError(error)) {
    return (
      <Alert variant="error">
        <AlertTitle>{errorMessage(error)}</AlertTitle>
      </Alert>
    );
  }
  switch (error.code) {
    case "PUBLIC_SITE_EXISTS":
      return (
        <Alert variant="warning">
          <AlertTitle>This organization already has a public docs site</AlertTitle>
          <AlertDescription>
            It was created while this form was open. Close this dialog to see it.
          </AlertDescription>
        </Alert>
      );
    case "PAYMENT_REQUIRED":
      return (
        <Alert variant="warning">
          <AlertTitle>
            {error.data.reason === "trial_expired" ? "Your trial has ended" : "No active plan"}
          </AlertTitle>
          <AlertDescription>
            <p>
              Choose a plan to create a docs site.{" "}
              <Link to="/settings/billing" className="underline underline-offset-4">
                View plans
              </Link>
            </p>
          </AlertDescription>
        </Alert>
      );
    default:
      return (
        <Alert variant="error">
          <AlertTitle>{error.message}</AlertTitle>
        </Alert>
      );
  }
}
