import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/utils/cn";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@shiru/ui/tooltip";
import type { ToOptions } from "@tanstack/react-router";
import { Link, useLocation } from "@tanstack/react-router";

type SidebarLinkItemProps = {
  type: "link";
  icon: React.FC<{ className?: string }>;
  label: string;
  href: ToOptions["to"];
  matchPath: (pathname: string) => boolean;
  badge?: string | number;
  tooltipLabel?: string;
};

type SidebarButtonItemProps = {
  type: "button";
  icon: React.FC<{ className?: string }>;
  label: string;
  onClick: () => void;
  tooltipLabel?: string;
};

export type SidebarItemProps = SidebarLinkItemProps | SidebarButtonItemProps;

const baseClasses = cn(
  "group relative flex h-8 w-full items-center gap-3 rounded-lg px-2 font-medium text-sidebar-foreground text-sm",
  "outline-border hover:bg-sidebar-accent hover:outline hover:text-sidebar-accent-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2",
);

export function SidebarItem(props: SidebarItemProps) {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const { icon: Icon, label, tooltipLabel } = props;

  const isActive = props.type === "link" ? props.matchPath(location.pathname) : false;

  const iconElement = (
    <Icon
      className={cn(
        "size-4 shrink-0 text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
        isActive && "text-sidebar-accent-foreground",
      )}
    />
  );

  const labelElement = (
    <div
      className={cn(
        "flex flex-1 items-center justify-between transition-opacity duration-200",
        isCollapsed ? "opacity-0" : "w-auto opacity-100",
      )}
    >
      <span className="truncate">{label}</span>
      {props.type === "link" && props.badge !== undefined && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-medium text-primary-foreground text-xs">
          {props.badge}
        </span>
      )}
    </div>
  );

  const content =
    props.type === "button" ? (
      <button
        type="button"
        onClick={props.onClick}
        className={cn(baseClasses, "cursor-pointer")}
        aria-label={label}
      >
        {iconElement}
        {labelElement}
      </button>
    ) : (
      <Link
        className={cn(
          baseClasses,
          isActive && "bg-sidebar-accent outline text-sidebar-accent-foreground",
        )}
        title={undefined}
        aria-label={label}
        to={props.href}
        preload="intent"
      >
        {iconElement}
        {labelElement}
      </Link>
    );

  return (
    <Tooltip disabled={!isCollapsed}>
      <TooltipTrigger render={content} />
      <TooltipPopup side="right">
        <span>{tooltipLabel ?? label}</span>
      </TooltipPopup>
    </Tooltip>
  );
}

type MobileNavItemProps = {
  icon: React.FC<{ className?: string }>;
  label: string;
  href: ToOptions["to"];
  matchPath: (pathname: string) => boolean;
};

export function MobileNavItem({ icon: Icon, label, href, matchPath }: MobileNavItemProps) {
  const location = useLocation();
  const isActive = matchPath(location.pathname);

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
