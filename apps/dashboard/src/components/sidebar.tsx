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
import { IconGearOutline18, IconHouse2Outline18 } from "nucleo-ui-outline-18";
import { OrgMenu } from "./org-menu";
import { UserMenu } from "./user-menu";

const tooltipHandle = TooltipCreateHandle<React.ComponentType>();

export function Sidebar() {
  const { isCollapsed } = useSidebar();
  const location = useLocation();

  return (
    <div
      className={cn(
        "relative flex h-full flex-col shrink-0 gap-3 border-r bg-default bg-background p-4 transition-[width] duration-200 ease-in-out motion-reduce:transition-none",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <OrgMenu />
      <nav className="mt-4 flex flex-1 flex-col gap-1.5">
        <TooltipProvider delay={0} timeout={500}>
          <Tooltip disabled={!isCollapsed}>
            <TooltipTrigger
              render={
                <SidebarItem
                  href="/"
                  icon={IconHouse2Outline18}
                  isActive={location.pathname === "/"}
                  label="Dashboard"
                />
              }
            />
            <TooltipPopup side="right">
              <span>Dashboard</span>
            </TooltipPopup>
          </Tooltip>

          <Separator className="mt-auto h-0 bg-transparent" orientation="horizontal" />
          <SidebarItem
            href="/settings"
            icon={IconGearOutline18}
            isActive={location.pathname.startsWith("/settings")}
            label="Settings"
          />

          <Tooltip disabled={!isCollapsed} handle={tooltipHandle}>
            {({ payload: Payload }) => (
              <TooltipPopup side="right">{Payload !== undefined && <Payload />}</TooltipPopup>
            )}
          </Tooltip>
        </TooltipProvider>
      </nav>
      <UserMenu />
    </div>
  );
}

type SidebarItemProps = {
  icon: React.FC<{ className?: string }>;
  label: string;
  href: ToOptions["to"];
  isActive?: boolean;
  badge?: string | number;
  onClick?: () => void;
} & Omit<React.ComponentProps<typeof Link>, "to" | "className" | "onClick">;

function SidebarItem({
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
        "group relative flex h-8 w-full items-center gap-3 rounded-lg px-2 font-medium text-foreground text-sm",
        "outline-border hover:bg-background hover:outline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive && "bg-background outline",
      )}
      onClick={onClick}
      title={undefined}
      aria-label={label}
      to={href}
      preload="intent"
    >
      <Icon className="size-4 shrink-0 text-foreground-muted" />

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
