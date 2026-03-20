import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/utils/cn";
import { Separator } from "@shiru/ui/separator";
import { TooltipProvider } from "@shiru/ui/tooltip";
import {
  IconBookOpen2OutlineDuo18,
  IconChatBubbleOutlineDuo18,
  IconGearOutlineDuo18,
  IconHouse2OutlineDuo18,
  IconSidebarLeftOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { OrgMenu } from "./org-menu";
import { SidebarItem } from "./sidebar-item";

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();

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
          <SidebarItem
            type="link"
            icon={IconHouse2OutlineDuo18}
            label="Dashboard"
            href="/"
            matchPath={(pathname) => pathname === "/"}
          />
          <SidebarItem
            type="link"
            icon={IconBookOpen2OutlineDuo18}
            label="Editor"
            href="/editor"
            matchPath={(pathname) => pathname.startsWith("/editor")}
          />

          <div className="mt-auto" />
          <Separator orientation="horizontal" />

          <SidebarItem
            type="link"
            icon={IconGearOutlineDuo18}
            label="Settings"
            href="/settings"
            matchPath={(pathname) => pathname.startsWith("/settings")}
          />
          <SidebarItem
            type="button"
            icon={IconChatBubbleOutlineDuo18}
            label="Feedback"
            onClick={() =>
              (
                window as Window & { uj?: { showWidget?: (type: string) => void } }
              ).uj?.showWidget?.("feedback")
            }
          />
          <SidebarItem
            type="button"
            icon={IconSidebarLeftOutlineDuo18}
            label="Collapse"
            tooltipLabel={isCollapsed ? "Expand" : "Collapse"}
            onClick={toggleSidebar}
          />
        </TooltipProvider>
      </nav>
    </div>
  );
}
