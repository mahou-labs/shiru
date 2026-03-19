import { Button } from "@shiru/ui/button";
import { Separator } from "@shiru/ui/separator";
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from "@shiru/ui/tooltip";
import {
  IconBookOpen2OutlineDuo18,
  IconChevronRightOutlineDuo18,
  IconGearOutlineDuo18,
  IconMenuBarsOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useSidebar } from "@/contexts/sidebar-context";
import type { AppShellSecondarySidebar } from "./app-shell-layout";
import { NotificationsButton } from "./notifications-button";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";

export function AppHeader({ secondarySidebar }: { secondarySidebar?: AppShellSecondarySidebar }) {
  const { isSecondaryCollapsed, setMobileOpen, setMobilePanel, toggleSecondarySidebar } =
    useSidebar();

  const ContextIcon =
    secondarySidebar?.kind === "navigation" ? IconGearOutlineDuo18 : IconBookOpen2OutlineDuo18;

  return (
    <header className="relative flex h-14 shrink-0 items-center border-b border-border bg-background px-4">
      <div className="z-10 flex min-w-0 items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
        >
          <IconMenuBarsOutlineDuo18 className="size-4" />
        </Button>

        <Separator orientation="vertical" className="h-5 lg:hidden" />

        {secondarySidebar && isSecondaryCollapsed && (
          <TooltipProvider delay={0} timeout={500}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hidden lg:inline-flex"
                    aria-label={`Show ${secondarySidebar.title}`}
                    onClick={toggleSecondarySidebar}
                  >
                    <IconChevronRightOutlineDuo18 className="size-4" />
                  </Button>
                }
              />
              <TooltipPopup side="bottom">
                <span>{`Show ${secondarySidebar.title}`}</span>
              </TooltipPopup>
            </Tooltip>
          </TooltipProvider>
        )}

        {secondarySidebar?.mobileMode === "sheet" && (
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            aria-label={`Open ${secondarySidebar.title}`}
            onClick={() => setMobilePanel("secondary")}
          >
            <ContextIcon className="size-4" />
          </Button>
        )}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(32rem,calc(100%-12rem))] -translate-x-1/2 -translate-y-1/2">
        <div className="pointer-events-auto">
          <SearchBar />
        </div>
      </div>

      <div className="z-10 ml-auto flex items-center gap-1">
        <NotificationsButton />
        <UserMenu />
      </div>
    </header>
  );
}
