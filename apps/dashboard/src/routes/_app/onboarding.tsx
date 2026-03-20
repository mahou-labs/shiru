import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShellLayout } from "@/components/app-shell-layout";
import { CreateOrgWizard } from "@/components/create-org-wizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";

export const Route = createFileRoute("/_app/onboarding")({
  component: OnboardingComponent,
});

function OnboardingComponent() {
  const navigate = useNavigate();

  return (
    <AppShellLayout>
      <div className="flex h-full items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>Welcome to Shiru!</CardTitle>
            <CardDescription>Let's get you started by creating your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateOrgWizard onSuccess={() => void navigate({ to: "/" })} />
          </CardContent>
        </Card>
      </div>
    </AppShellLayout>
  );
}
