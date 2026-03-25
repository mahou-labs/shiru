import { useEffect, useRef, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "motion/react";
import { IconCheckOutlineDuo18, IconXmarkOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { z } from "zod";

import { Button } from "@shiru/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/field";
import { Form } from "@shiru/ui/form";
import { Input } from "@shiru/ui/input";
import { Spinner } from "@shiru/ui/spinner";
import { toastManager } from "@shiru/ui/toast";

import { orpc } from "@/utils/orpc-client";
import { StepIndicator } from "./step-indicator";

const STEPS = ["Website", "Details"] as const;

const slugSchema = z
  .string()
  .trim()
  .min(4, "Slug must be at least 4 characters.")
  .regex(/^[a-z0-9-]+$/, "Use only lowercase letters, numbers, and hyphens.")
  .refine((s) => !(s.startsWith("-") || s.endsWith("-")), {
    message: "Slug cannot start or end with a hyphen.",
  })
  .refine((s) => !s.includes("--"), {
    message: "Slug cannot contain consecutive hyphens.",
  });

type WizardData = {
  websiteUrl: string;
  name: string;
  slug: string;
  logo: string | null;
};

type CreateOrgWizardProps = {
  onSuccess: () => void;
  onCancel?: () => void;
};

export function CreateOrgWizard({ onSuccess, onCancel }: CreateOrgWizardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    websiteUrl: "",
    name: "",
    slug: "",
    logo: null,
  });

  const goForward = () => {
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const updateData = (partial: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...partial }));
  };

  const { mutateAsync: createOrg, isPending: isCreating } = useMutation(
    orpc.organization.createOrg.mutationOptions(),
  );

  const handleFinalSubmit = async () => {
    try {
      const org = await createOrg({
        name: wizardData.name.trim(),
        slug: wizardData.slug.trim(),
        logo: wizardData.logo ?? undefined,
      });

      if (org) {
        toastManager.add({
          title: "Organization created successfully!",
          type: "success",
        });

        await queryClient.invalidateQueries(orpc.organization.getOrgList.queryOptions());
        await queryClient.fetchQuery(orpc.user.getSession.queryOptions());
        await router.invalidate();
        onSuccess();
      } else {
        toastManager.add({
          title: "Failed to create organization",
          type: "error",
        });
      }
    } catch {
      toastManager.add({
        title: "Failed to create organization",
        type: "error",
      });
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        setContentHeight(height);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [currentStep]);

  return (
    <div className="flex flex-col gap-6">
      <div className="px-2 pt-1">
        <StepIndicator currentStep={currentStep} steps={[...STEPS]} />
      </div>

      <motion.div
        animate={{ height: contentHeight }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative overflow-hidden"
      >
        <AnimatePresence custom={direction} initial={false} mode="popLayout">
          <motion.div
            ref={contentRef}
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {currentStep === 0 && (
              <StepWebsite
                data={wizardData}
                onCancel={onCancel}
                onNext={(data) => {
                  updateData(data);
                  goForward();
                }}
              />
            )}
            {currentStep === 1 && (
              <StepDetails
                data={wizardData}
                isCreating={isCreating}
                onBack={goBack}
                onSubmit={() => void handleFinalSubmit()}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function StepWebsite({
  data,
  onCancel,
  onNext,
}: {
  data: WizardData;
  onCancel?: () => void;
  onNext: (partial: Partial<WizardData>) => void;
}) {
  const [url, setUrl] = useState(data.websiteUrl);
  const [isScraping, setIsScraping] = useState(false);

  const { mutateAsync: scrapeWebsite } = useMutation(
    orpc.onboarding.scrapeWebsite.mutationOptions(),
  );

  const handleContinue = async () => {
    if (!url.trim()) {
      onNext({ websiteUrl: "" });
      return;
    }

    setIsScraping(true);
    try {
      let normalizedUrl = url.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      const metadata = await scrapeWebsite({ url: normalizedUrl });

      onNext({
        websiteUrl: url.trim(),
        name: metadata.name ?? "",
        slug: metadata.suggestedSlug ?? "",
        logo: metadata.logo ?? null,
      });
    } catch {
      onNext({ websiteUrl: url.trim() });
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">What's your company website?</h3>
        <p className="text-sm text-muted-foreground">
          We'll use this to set up your organization details automatically.
        </p>
      </div>

      <Field>
        <FieldLabel>Website URL</FieldLabel>
        <Input
          disabled={isScraping}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleContinue();
            }
          }}
          placeholder="https://example.com"
          value={url}
        />
        <FieldDescription>Enter your company or product website</FieldDescription>
      </Field>

      <div className="flex items-center justify-between pt-2">
        {onCancel ? (
          <Button disabled={isScraping} onClick={onCancel} type="button" variant="ghost">
            Cancel
          </Button>
        ) : (
          <Button
            disabled={isScraping}
            onClick={() => onNext({ websiteUrl: "" })}
            type="button"
            variant="ghost"
          >
            Skip
          </Button>
        )}
        <Button disabled={isScraping} onClick={() => void handleContinue()} type="button">
          {isScraping ? (
            <>
              <Spinner className="mr-2 size-4" />
              Looking up your company...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}

function StepDetails({
  data,
  isCreating,
  onBack,
  onSubmit,
}: {
  data: WizardData;
  isCreating: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const detailsSchema = z.object({
    name: z.string().min(1, "Organization name is required"),
    slug: slugSchema,
  });

  const form = useForm({
    defaultValues: { name: data.name, slug: data.slug },
    validators: { onSubmit: detailsSchema },
    onSubmit: () => {
      onSubmit();
    },
  });

  const slug = useStore(form.store, (state) => state.values.slug);
  const isSlugValid = slugSchema.safeParse(slug).success;
  const debouncedSlug = useDebounce(isSlugValid ? slug : "", 500);

  const { data: slugAvailable, isLoading } = useQuery(
    orpc.organization.checkSlugAvailability.queryOptions({
      input: debouncedSlug,
      enabled: isSlugValid && slug === debouncedSlug,
    }),
  );

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Organization details</h3>
          <p className="text-sm text-muted-foreground">
            {data.websiteUrl
              ? "We pre-filled these from your website. Feel free to edit."
              : "Enter a name and URL slug for your organization."}
          </p>
        </div>

        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel>Organization Name</FieldLabel>
              <Input
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
            onChange: slugSchema,
          }}
        >
          {(field) => {
            const isTyping = field.state.value !== debouncedSlug;

            return (
              <Field>
                <FieldLabel>Organization Slug</FieldLabel>
                <Input
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
                        <IconCheckOutlineDuo18 className="size-4" /> Available
                      </span>
                    ) : (
                      <span className="flex gap-1 text-destructive">
                        <IconXmarkOutlineDuo18 className="size-4" /> Taken
                      </span>
                    )}
                  </FieldDescription>
                )}
              </Field>
            );
          }}
        </form.Field>

        <div className="flex items-center justify-between pt-2">
          <Button disabled={isCreating} onClick={onBack} type="button" variant="ghost">
            Back
          </Button>
          <Button
            disabled={
              isCreating ||
              !form.state.canSubmit ||
              slug !== debouncedSlug ||
              (debouncedSlug.length >= 4 && isLoading) ||
              !slugAvailable
            }
            type="submit"
          >
            {isCreating ? (
              <>
                <Spinner className="mr-2 size-4" />
                Creating...
              </>
            ) : (
              "Create Organization"
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
}
