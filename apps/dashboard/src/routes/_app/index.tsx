import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/page";

export const Route = createFileRoute("/_app/")({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <Page title="Dashboard" description="Your workspace home">
      <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
        Nothing here yet.
      </div>
    </Page>
  );
}
