import type { ReactNode } from "react";
import { Button } from "@shiru/ui/button";
import { IconChevronLeftOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { secondarySidebarDesktopWidth, useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/utils/cn";
import type { SecondarySidebarKind } from "./app-shell-layout";

const kindDescriptions = {
  navigation: "Screen-specific navigation",
  workspace: "Workspace tools and context",
  actions: "Contextual actions and shortcuts",
} as const;

type SecondarySidebarProps = {
  children: ReactNode;
  desktopWidth?: number;
  kind: SecondarySidebarKind;
  title: string;
};

export function SecondarySidebar({ children, desktopWidth, kind, title }: SecondarySidebarProps) {
  const { isSecondaryCollapsed, toggleSecondarySidebar } = useSidebar();
  const width = desktopWidth ?? secondarySidebarDesktopWidth;

  return (
    <div
      className={cn(
        "relative hidden h-full shrink-0 overflow-hidden border-r border-border transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:block",
        isSecondaryCollapsed && "border-r-transparent",
      )}
      style={{ width: isSecondaryCollapsed ? 0 : width }}
    >
      <aside
        aria-hidden={isSecondaryCollapsed}
        aria-label={`${title} sidebar`}
        className={cn(
          "absolute inset-y-0 left-0 flex h-full flex-col bg-background/95 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isSecondaryCollapsed
            ? "pointer-events-none -translate-x-3 opacity-0"
            : "translate-x-0 opacity-100",
        )}
        style={{ width }}
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground text-sm">{title}</p>
            <p className="truncate text-muted-foreground text-xs">{kindDescriptions[kind]}</p>
          </div>

          <Button
            size="icon"
            variant="ghost"
            aria-label={`Collapse ${title} sidebar`}
            className="size-8 shrink-0"
            onClick={toggleSecondarySidebar}
          >
            <IconChevronLeftOutlineDuo18 className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
      </aside>
    </div>
  );
}
