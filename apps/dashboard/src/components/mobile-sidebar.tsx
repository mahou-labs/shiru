import { cn } from "@/utils/cn";
import { Separator } from "@shiru/ui/separator";
import { Sheet, SheetPopup } from "@shiru/ui/sheet";
import { Link, useLocation } from "@tanstack/react-router";
import type { ToOptions } from "@tanstack/react-router";
import { useSidebar } from "@/contexts/sidebar-context";
import { navItems } from "./nav-items";
import { OnboardingChecklist } from "./onboarding-checklist";
import { OrgMenu } from "./org-menu";

export function MobileSidebar() {
  const { mobilePanel, secondarySidebar, setMobilePanel } = useSidebar();
  const location = useLocation();

  const topItems = navItems.filter((item) => !item.bottom);
  const bottomItems = navItems.filter((item) => item.bottom);
  const secondaryNavContent =
    secondarySidebar?.mobileMode === "nav-section"
      ? (secondarySidebar.mobileContent ?? secondarySidebar.content)
      : null;

  return (
    <Sheet
      open={mobilePanel === "primary"}
      onOpenChange={(open) => setMobilePanel(open ? "primary" : null)}
    >
      <SheetPopup
        side="left"
        showCloseButton={false}
        className="w-64 max-w-[calc(100%-3rem)] rounded-none before:rounded-none sm:before:rounded-none"
      >
        <div className="flex h-full flex-col gap-3 bg-sidebar p-4">
          <OrgMenu collapsed={false} />
          <OnboardingChecklist />
          <nav className="mt-3 flex flex-1 flex-col gap-1.5">
            {topItems.map((item) => (
              <MobileNavItem
                key={item.label}
                href={item.href}
                icon={item.icon}
                isActive={item.matchPath(location.pathname)}
                label={item.label}
              />
            ))}

            {secondaryNavContent && (
              <>
                <div className="px-2 pt-3 pb-1 text-muted-foreground text-xs uppercase tracking-[0.12em]">
                  This screen
                </div>
                <div className="space-y-1">{secondaryNavContent}</div>
              </>
            )}

            <div className="mt-auto" />
            <Separator orientation="horizontal" />

            {bottomItems.map((item) => (
              <MobileNavItem
                key={item.label}
                href={item.href}
                icon={item.icon}
                isActive={item.matchPath(location.pathname)}
                label={item.label}
              />
            ))}
          </nav>
        </div>
      </SheetPopup>
    </Sheet>
  );
}

type MobileNavItemProps = {
  icon: React.FC<{ className?: string }>;
  label: string;
  href: ToOptions["to"];
  isActive?: boolean;
};

function MobileNavItem({ icon: Icon, label, href, isActive = false }: MobileNavItemProps) {
  return (
    <Link
      className={cn(
        "group relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 font-medium text-sidebar-foreground text-sm",
        "outline-border hover:bg-sidebar-accent hover:outline hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2",
        isActive && "bg-sidebar-accent outline text-sidebar-accent-foreground",
      )}
      title={undefined}
      aria-label={label}
      to={href}
      preload="intent"
    >
      <Icon
        className={cn(
          "size-4 shrink-0 text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
          isActive && "text-sidebar-accent-foreground",
        )}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}
