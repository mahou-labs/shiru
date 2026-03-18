import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  IconCircleCheckOutlineDuo18,
  IconGlobe2OutlineDuo18,
  IconCircleUserOutlineDuo18,
  IconUserPlusOutlineDuo18,
  IconXmarkOutlineDuo18,
  IconChevronRightOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { orpc } from "@/utils/orpc-client";

const ONBOARDING_RESET_EVENT = "shiru:onboarding-reset";

type OnboardingStep = {
  id: string;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  href: string;
  completed: boolean;
};

function getStorageKey(orgId: string) {
  return `shiru:onboarding_dismissed:${orgId}`;
}

function isDismissed(orgId: string | undefined): boolean {
  if (!orgId || typeof window === "undefined") return false;
  return localStorage.getItem(getStorageKey(orgId)) === "true";
}

function setDismissed(orgId: string, value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(getStorageKey(orgId), "true");
  } else {
    localStorage.removeItem(getStorageKey(orgId));
  }
}

/**
 * Sidebar onboarding checklist. Shows a compact progress card
 * when the active org has incomplete setup steps.
 *
 * - Disappears automatically when all steps are complete
 * - Can be manually dismissed (persisted per-org in localStorage)
 * - Dismissal can be reset from the Settings overview page
 */
export function OnboardingChecklist({ collapsed }: { collapsed?: boolean }) {
  const { data: session } = useQuery(orpc.user.getSession.queryOptions());
  const orgId = session?.session.activeOrganizationId;

  const { data: status, isLoading } = useQuery({
    ...orpc.onboarding.getOnboardingStatus.queryOptions(),
    enabled: !!orgId,
    // Refetch when window regains focus (user may have completed a step)
    refetchOnWindowFocus: true,
  });

  const [dismissed, setDismissedState] = useState(() => isDismissed(orgId ?? undefined));

  // Sync dismissed state when org changes
  useEffect(() => {
    setDismissedState(isDismissed(orgId ?? undefined));
  }, [orgId]);

  // Listen for reset events from the Settings page
  useEffect(() => {
    const handler = () => {
      setDismissedState(isDismissed(orgId ?? undefined));
    };
    window.addEventListener(ONBOARDING_RESET_EVENT, handler);
    return () => window.removeEventListener(ONBOARDING_RESET_EVENT, handler);
  }, [orgId]);

  const handleDismiss = useCallback(() => {
    if (orgId) {
      setDismissed(orgId, true);
      setDismissedState(true);
    }
  }, [orgId]);

  // Don't render if loading, no data, all complete, or dismissed
  if (isLoading || !status || status.allComplete || dismissed) {
    return null;
  }

  const steps: OnboardingStep[] = [
    {
      id: "domain",
      label: "Connect domain",
      description: "Serve docs on your own subdomain",
      icon: IconGlobe2OutlineDuo18,
      href: "/settings/domain",
      completed: status.domain,
    },
    {
      id: "profile",
      label: "Add organization logo",
      description: "Customize your workspace",
      icon: IconCircleUserOutlineDuo18,
      href: "/settings/organization",
      completed: status.profile,
    },
    {
      id: "team",
      label: "Invite your team",
      description: "Collaborate on documentation",
      icon: IconUserPlusOutlineDuo18,
      href: "/settings/organization",
      completed: status.team,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;

  // Collapsed sidebar: show a compact progress indicator only
  if (collapsed) {
    return (
      <div className="flex justify-center py-1">
        <div
          className="relative flex size-8 items-center justify-center rounded-lg bg-primary/8 text-primary"
          title={`Setup: ${completedCount} of ${totalCount} complete`}
        >
          <span className="font-mono text-[10px] font-semibold leading-none">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-lg border border-sidebar-border bg-sidebar p-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-sidebar-foreground">Get started</h3>
          <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
            {completedCount} of {totalCount}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex size-5 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:text-sidebar-foreground"
          aria-label="Dismiss onboarding"
        >
          <IconXmarkOutlineDuo18 className="size-3" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-sidebar-accent">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-0.5">
        {steps.map((step) => (
          <OnboardingStepItem key={step.id} step={step} />
        ))}
      </div>
    </div>
  );
}

function OnboardingStepItem({ step }: { step: OnboardingStep }) {
  const Icon = step.icon;

  return (
    <Link
      to={step.href}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors",
        step.completed ? "opacity-60" : "hover:bg-sidebar-accent",
      )}
      aria-label={step.completed ? `${step.label} (completed)` : step.label}
      preload="intent"
    >
      {step.completed ? (
        <IconCircleCheckOutlineDuo18 className="size-3.5 shrink-0 text-primary" />
      ) : (
        <Icon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-sidebar-foreground" />
      )}

      <span
        className={cn(
          "flex-1 truncate text-xs",
          step.completed
            ? "text-muted-foreground line-through decoration-muted-foreground/40"
            : "text-sidebar-foreground",
        )}
      >
        {step.label}
      </span>

      {!step.completed && (
        <IconChevronRightOutlineDuo18 className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </Link>
  );
}

/**
 * Resets the onboarding dismissed state for the given org.
 * Dispatches a custom event so the sidebar checklist re-renders immediately.
 */
export function resetOnboardingDismissal(orgId: string) {
  setDismissed(orgId, false);
  window.dispatchEvent(new CustomEvent(ONBOARDING_RESET_EVENT));
}
