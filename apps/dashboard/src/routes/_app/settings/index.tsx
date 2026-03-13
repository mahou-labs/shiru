import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pt-4">
      <p className="text-muted-foreground">
        Welcome to the settings panel. Choose a tab above to configure your preferences.
      </p>
    </div>
  );
}
