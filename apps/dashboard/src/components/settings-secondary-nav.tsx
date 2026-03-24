import { Link, useLocation } from "@tanstack/react-router";
import {
  IconHouse2OutlineDuo18,
  IconSunOutlineDuo18,
  IconUsersOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { cn } from "@/utils/cn";

const settingsNavItems = [
  {
    description: "Overview, setup, and workspace defaults",
    href: "/settings",
    icon: IconHouse2OutlineDuo18,
    label: "Overview",
    matchPath: (pathname: string) => pathname === "/settings",
  },
  {
    description: "Manage members, roles, and organization details",
    href: "/settings/organization",
    icon: IconUsersOutlineDuo18,
    label: "Organization",
    matchPath: (pathname: string) => pathname.startsWith("/settings/organization"),
  },
  {
    description: "Personal preferences and appearance settings",
    href: "/settings/account",
    icon: IconSunOutlineDuo18,
    label: "Account",
    matchPath: (pathname: string) => pathname.startsWith("/settings/account"),
  },
];

export function SettingsSecondaryNav({ as = "nav" }: { as?: "div" | "nav" }) {
  const location = useLocation();
  const Root = as;

  return (
    <Root className="space-y-1" aria-label={as === "nav" ? "Settings sections" : undefined}>
      {settingsNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.matchPath(location.pathname);

        return (
          <Link
            key={item.label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex min-h-11 items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
              "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive && "bg-accent text-accent-foreground",
            )}
            preload="intent"
            to={item.href}
          >
            <Icon
              className={cn(
                "mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors",
                isActive && "text-accent-foreground",
              )}
            />

            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">{item.label}</p>
              <p className="mt-0.5 line-clamp-2 text-muted-foreground text-xs">
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}
    </Root>
  );
}
