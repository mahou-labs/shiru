import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/utils/cn";
import { Separator } from "@shiru/ui/separator";
import {
  Tooltip,
  TooltipCreateHandle,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@shiru/ui/tooltip";
import type { ToOptions } from "@tanstack/react-router";
import { Link, useLocation } from "@tanstack/react-router";
import { IconSidebarLeftOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { navItems } from "./nav-items";
import { OrgMenu } from "./org-menu";

const tooltipHandle = TooltipCreateHandle<React.ComponentType>();

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const location = useLocation();

  const topItems = navItems.filter((item) => !item.bottom);
  const bottomItems = navItems.filter((item) => item.bottom);

  return (
    <div
      className={cn(
        "relative hidden h-full flex-col shrink-0 gap-3 border-r border-sidebar-border bg-sidebar p-4 transition-[width] duration-200 ease-in-out motion-reduce:transition-none lg:flex",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <OrgMenu collapsed={isCollapsed} />
      <nav className="mt-3 flex flex-1 flex-col gap-1.5">
        <TooltipProvider delay={0} timeout={500}>
          {topItems.map((item) => (
            <Tooltip key={item.label} disabled={!isCollapsed}>
              <TooltipTrigger
                render={
                  <SidebarItem
                    href={item.href}
                    icon={item.icon}
                    isActive={item.matchPath(location.pathname)}
                    label={item.label}
                  />
                }
              />
              <TooltipPopup side="right">
                <span>{item.label}</span>
              </TooltipPopup>
            </Tooltip>
          ))}

          <div className="mt-auto" />
          <Separator orientation="horizontal" />

          {bottomItems.map((item) => (
            <Tooltip key={item.label} disabled={!isCollapsed}>
              <TooltipTrigger
                render={
                  <SidebarItem
                    href={item.href}
                    icon={item.icon}
                    isActive={item.matchPath(location.pathname)}
                    label={item.label}
                  />
                }
              />
              <TooltipPopup side="right">
                <span>{item.label}</span>
              </TooltipPopup>
            </Tooltip>
          ))}

          <Tooltip disabled={!isCollapsed}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className={cn(
                    "group relative flex h-8 w-full cursor-pointer items-center gap-3 rounded-lg px-2 font-medium text-sidebar-foreground text-sm",
                    "outline-border hover:bg-sidebar-accent hover:outline hover:text-sidebar-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2",
                  )}
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <IconSidebarLeftOutlineDuo18 className="size-4 shrink-0 text-sidebar-foreground group-hover:text-sidebar-accent-foreground" />
                  <span
                    className={cn(
                      "truncate transition-opacity duration-200",
                      isCollapsed ? "opacity-0" : "opacity-100",
                    )}
                  >
                    Collapse
                  </span>
                </button>
              }
            />
            <TooltipPopup side="right">
              <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            </TooltipPopup>
          </Tooltip>

          <Tooltip disabled={!isCollapsed} handle={tooltipHandle}>
            {({ payload: Payload }) => (
              <TooltipPopup side="right">{Payload !== undefined && <Payload />}</TooltipPopup>
            )}
          </Tooltip>
        </TooltipProvider>
      </nav>
    </div>
  );
}

export type SidebarItemProps = {
  icon: React.FC<{ className?: string }>;
  label: string;
  href: ToOptions["to"];
  isActive?: boolean;
  badge?: string | number;
  onClick?: () => void;
} & Omit<React.ComponentProps<typeof Link>, "to" | "className" | "onClick">;

export function SidebarItem({
  icon: Icon,
  label,
  href,
  isActive = false,
  badge,
  onClick,
  ...props
}: SidebarItemProps) {
  const { isCollapsed } = useSidebar();

  return (
    <Link
      {...props}
      className={cn(
        "group relative flex h-8 w-full items-center gap-3 rounded-lg px-2 font-medium text-sidebar-foreground text-sm",
        "outline-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2",
        isActive && "bg-sidebar-accent outline text-sidebar-accent-foreground",
      )}
      onClick={onClick}
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

      <div
        className={cn(
          "flex flex-1 items-center justify-between transition-opacity duration-200",
          isCollapsed ? "opacity-0" : "w-auto opacity-100",
        )}
      >
        <span className="truncate">{label}</span>
        {badge !== undefined && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-medium text-primary-foreground text-xs">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
