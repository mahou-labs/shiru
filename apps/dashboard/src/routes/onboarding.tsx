import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@shiru/ui/components/card";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { CreateOrganizationForm } from "@/components/create-organization-form";
import { sessionQuery } from "@/lib/queries";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.fetchQuery(sessionQuery);
    if (!session) throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } });
  },
  component: Onboarding,
});

function Onboarding() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-sidebar p-4">
      <p className="font-heading font-semibold text-lg">Shiru</p>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your organization</CardTitle>
          <CardDescription>
            Organizations hold your docs and your team. Your 30-day trial starts now.
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <CreateOrganizationForm />
        </CardPanel>
      </Card>
    </div>
  );
}
