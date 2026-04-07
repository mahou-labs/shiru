import { Link, useLocation } from "@tanstack/react-router";
import { IconBookOpen2OutlineDuo18, IconHouse2OutlineDuo18 } from "nucleo-ui-outline-duo-18";

import { cn } from "@/utils/cn";

const docsNavItems = [
  {
    description: "Live status and one-click publish",
    href: "/docs",
    icon: IconHouse2OutlineDuo18,
    label: "Overview",
    matchPath: (pathname: string) => pathname === "/docs",
  },
  {
    description: "Past publishes and their status",
    href: "/docs/history",
    icon: IconBookOpen2OutlineDuo18,
    label: "History",
    matchPath: (pathname: string) => pathname.startsWith("/docs/history"),
  },
];

export function DocsSecondaryNav({ as = "nav" }: { as?: "div" | "nav" }) {
  const location = useLocation();
  const Root = as;

  return (
    <Root className="space-y-1" aria-label={as === "nav" ? "Docs sections" : undefined}>
      {docsNavItems.map((item) => {
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
