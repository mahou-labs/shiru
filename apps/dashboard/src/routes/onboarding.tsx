import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";

import { CreateOrgWizard } from "@/components/create-org-wizard";
import { LoadingScreen } from "@/components/loading-screen";
import { orpc } from "@/utils/orpc-client";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingRoute,
});

function OnboardingRoute() {
  const navigate = useNavigate();
  const { data: session, isPending } = useQuery(
    orpc.user.getSession.queryOptions({ staleTime: Infinity }),
  );

  if (isPending) return <LoadingScreen />;
  if (!session) return <Navigate to="/auth/signin" />;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-sidebar p-4 sm:p-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-background)_0%,transparent_60%)]" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <div className="mb-8">
          <p className="font-heading text-xl font-semibold text-foreground">Shiru</p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Welcome to Shiru!</CardTitle>
            <CardDescription>Let's get you started by creating your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateOrgWizard onSuccess={() => void navigate({ to: "/" })} />
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Mahou Labs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
