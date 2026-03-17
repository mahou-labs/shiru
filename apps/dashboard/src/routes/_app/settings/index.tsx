import { createFileRoute, Link } from "@tanstack/react-router";
import { IconSunOutlineDuo18, IconUsersOutlineDuo18 } from "nucleo-ui-outline-duo-18";

export const Route = createFileRoute("/_app/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid gap-3 pt-4 sm:grid-cols-2">
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
    </div>
  );
}
