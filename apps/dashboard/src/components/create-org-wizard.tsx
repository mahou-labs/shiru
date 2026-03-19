import { useEffect, useRef, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "motion/react";
import {
  IconCheckOutlineDuo18,
  IconCloudUploadOutlineDuo18,
  IconCodeBranchOutlineDuo18,
  IconGlobe2OutlineDuo18,
  IconXmarkOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { z } from "zod";

import { Button } from "@shiru/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/field";
import { Form } from "@shiru/ui/form";
import { Input } from "@shiru/ui/input";
import { Spinner } from "@shiru/ui/spinner";
import { toastManager } from "@shiru/ui/toast";

import { cn } from "@/utils/cn";
import { orpc } from "@/utils/orpc-client";
import { StepIndicator } from "./step-indicator";

const STEPS = ["Website", "Details", "Hosting", "Domain"] as const;

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

const HOSTNAME_REGEX = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

type WizardData = {
  websiteUrl: string;
  name: string;
  slug: string;
  logo: string | null;
  hostingMode: "managed" | "github";
  hostname: string;
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
    hostingMode: "managed",
    hostname: "",
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
        hostingMode: wizardData.hostingMode,
        hostname: wizardData.hostname.trim() || undefined,
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
                onBack={goBack}
                onNext={(data) => {
                  updateData(data);
                  goForward();
                }}
              />
            )}
            {currentStep === 2 && (
              <StepHosting
                data={wizardData}
                onBack={goBack}
                onNext={(mode) => {
                  updateData({ hostingMode: mode });
                  goForward();
                }}
              />
            )}
            {currentStep === 3 && (
              <StepDomain
                data={wizardData}
                isCreating={isCreating}
                onBack={goBack}
                onChange={(hostname) => updateData({ hostname })}
                onSkip={() => {
                  updateData({ hostname: "" });
                  void handleFinalSubmit();
                }}
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
  onBack,
  onNext,
}: {
  data: WizardData;
  onBack: () => void;
  onNext: (partial: Partial<WizardData>) => void;
}) {
  const detailsSchema = z.object({
    name: z.string().min(1, "Organization name is required"),
    slug: slugSchema,
  });

  const form = useForm({
    defaultValues: { name: data.name, slug: data.slug },
    validators: { onSubmit: detailsSchema },
    onSubmit: ({ value }) => {
      onNext({ name: value.name, slug: value.slug });
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
          <Button onClick={onBack} type="button" variant="ghost">
            Back
          </Button>
          <Button
            disabled={
              !form.state.canSubmit ||
              slug !== debouncedSlug ||
              (debouncedSlug.length >= 4 && isLoading) ||
              !slugAvailable
            }
            type="submit"
          >
            Continue
          </Button>
        </div>
      </div>
    </Form>
  );
}

function StepHosting({
  data,
  onBack,
  onNext,
}: {
  data: WizardData;
  onBack: () => void;
  onNext: (mode: "managed" | "github") => void;
}) {
  const [selected, setSelected] = useState<"managed" | "github">(data.hostingMode);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">How do you want to host your docs?</h3>
        <p className="text-sm text-muted-foreground">
          Choose how your documentation will be deployed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <HostingCard
          description="We handle deployment, hosting, and updates for you."
          icon={<IconCloudUploadOutlineDuo18 className="size-5" />}
          isSelected={selected === "managed"}
          onClick={() => setSelected("managed")}
          title="Managed Hosting"
        />
        <HostingCard
          description="Connect a GitHub repo and deploy on your own infrastructure."
          icon={<IconCodeBranchOutlineDuo18 className="size-5" />}
          isSelected={selected === "github"}
          onClick={() => setSelected("github")}
          title="Self-hosted via GitHub"
        />
      </div>

      <p className="text-xs text-muted-foreground">You can change this later in Settings.</p>

      <div className="flex items-center justify-between pt-2">
        <Button onClick={onBack} type="button" variant="ghost">
          Back
        </Button>
        <Button onClick={() => onNext(selected)} type="button">
          Continue
        </Button>
      </div>
    </div>
  );
}

function HostingCard({
  description,
  icon,
  isSelected,
  onClick,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-left transition-all duration-150",
        isSelected
          ? "border-primary bg-primary/[0.04] ring-1 ring-primary/30"
          : "border-border hover:border-muted-foreground/30 hover:bg-muted/30",
      )}
    >
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-md",
          isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function StepDomain({
  data,
  isCreating,
  onBack,
  onChange,
  onSkip,
  onSubmit,
}: {
  data: WizardData;
  isCreating: boolean;
  onBack: () => void;
  onChange: (hostname: string) => void;
  onSkip: () => void;
  onSubmit: () => void;
}) {
  const [hostname, setHostname] = useState(data.hostname);
  const isHostnameValid = hostname.trim() === "" || HOSTNAME_REGEX.test(hostname.trim());
  const hasHostname = hostname.trim().length > 0 && HOSTNAME_REGEX.test(hostname.trim());

  const handleHostnameChange = (value: string) => {
    setHostname(value);
    onChange(value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Set up a custom domain</h3>
        <p className="text-sm text-muted-foreground">
          Connect a custom domain to serve your documentation at your own URL.
        </p>
      </div>

      <Field>
        <FieldLabel>
          <IconGlobe2OutlineDuo18 className="mr-1 inline size-4" />
          Hostname
        </FieldLabel>
        <Input
          disabled={isCreating}
          onChange={(e) => handleHostnameChange(e.target.value)}
          placeholder="docs.example.com"
          value={hostname}
        />
        {hostname.trim() && !isHostnameValid && (
          <FieldError>Enter a valid hostname like docs.example.com</FieldError>
        )}
      </Field>

      <p className="text-xs text-muted-foreground">
        This step is optional. You can set up a custom domain later in Settings.
      </p>

      <div className="flex items-center justify-between pt-2">
        <Button disabled={isCreating} onClick={onBack} type="button" variant="ghost">
          Back
        </Button>
        <div className="flex gap-2">
          <Button disabled={isCreating} onClick={onSkip} type="button" variant="outline">
            Skip
          </Button>
          <Button
            disabled={isCreating || (hostname.trim().length > 0 && !hasHostname)}
            onClick={onSubmit}
            type="button"
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
    </div>
  );
}
