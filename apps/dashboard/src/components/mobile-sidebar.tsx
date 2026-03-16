import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/utils/cn";
import { Separator } from "@shiru/ui/separator";
import { Sheet, SheetPopup } from "@shiru/ui/sheet";
import { Link, useLocation } from "@tanstack/react-router";
import type { ToOptions } from "@tanstack/react-router";
import { navItems } from "./nav-items";
import { OrgMenu } from "./org-menu";

export function MobileSidebar() {
  const { isMobileOpen, setMobileOpen } = useSidebar();
  const location = useLocation();

  const topItems = navItems.filter((item) => !item.bottom);
  const bottomItems = navItems.filter((item) => item.bottom);

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetPopup
        side="left"
        showCloseButton={false}
        className="w-64 max-w-[calc(100%-3rem)] rounded-none before:rounded-none sm:before:rounded-none"
      >
        <div className="flex h-full flex-col gap-3 bg-sidebar p-4">
          <OrgMenu />
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
        "group relative flex h-8 w-full items-center gap-3 rounded-lg px-2 font-medium text-sidebar-foreground text-sm",
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
