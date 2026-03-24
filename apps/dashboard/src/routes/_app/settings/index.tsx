import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  IconClipboardCheckOutlineDuo18,
  IconSunOutlineDuo18,
  IconUsersOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { orpc } from "@/utils/orpc-client";

function resetOnboardingDismissal(orgId: string) {
  try {
    localStorage.removeItem(`onboarding-dismissed-${orgId}`);
  } catch {
    // noop
  }
}

export const Route = createFileRoute("/_app/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: session } = useQuery(orpc.user.getSession.queryOptions());
  const { data: onboardingStatus } = useQuery({
    ...orpc.onboarding.getOnboardingStatus.queryOptions(),
    enabled: !!session?.session.activeOrganizationId,
  });

  const orgId = session?.session.activeOrganizationId;
  const showSetupGuide = onboardingStatus && !onboardingStatus.allComplete;

  const handleResetOnboarding = () => {
    if (orgId) {
      resetOnboardingDismissal(orgId);
      // Force re-render of the sidebar checklist by invalidating the query
      void queryClient.invalidateQueries(orpc.onboarding.getOnboardingStatus.queryOptions());
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/settings/organization"
          className="flex items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent"
        >
          <IconUsersOutlineDuo18 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Organization</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Members and roles</p>
          </div>
        </Link>
        <Link
          to="/settings/account"
          className="flex items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent"
        >
          <IconSunOutlineDuo18 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Account</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Theme and appearance</p>
          </div>
        </Link>
        {showSetupGuide && (
          <button
            type="button"
            onClick={handleResetOnboarding}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent"
          >
            <IconClipboardCheckOutlineDuo18 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Setup Guide</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Show the onboarding checklist in the sidebar
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
