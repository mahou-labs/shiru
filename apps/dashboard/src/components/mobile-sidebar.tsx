import { useSidebar } from "@/contexts/sidebar-context";
import { Separator } from "@shiru/ui/separator";
import { Sheet, SheetPopup } from "@shiru/ui/sheet";
import {
  IconBookOpen2OutlineDuo18,
  IconGearOutlineDuo18,
  IconHouse2OutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import type { AppShellSecondarySidebar } from "./app-shell-layout";
import { OrgMenu } from "./org-menu";
import { MobileNavItem } from "./sidebar-item";

export function MobileSidebar({
  secondarySidebar,
}: {
  secondarySidebar?: AppShellSecondarySidebar;
}) {
  const { mobilePanel, setMobilePanel } = useSidebar();

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
          <nav className="mt-3 flex flex-1 flex-col gap-1.5">
            <MobileNavItem
              icon={IconHouse2OutlineDuo18}
              label="Dashboard"
              href="/"
              matchPath={(pathname) => pathname === "/"}
            />
            <MobileNavItem
              icon={IconBookOpen2OutlineDuo18}
              label="Editor"
              href="/editor"
              matchPath={(pathname) => pathname.startsWith("/editor")}
            />

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

            <MobileNavItem
              icon={IconGearOutlineDuo18}
              label="Settings"
              href="/settings"
              matchPath={(pathname) => pathname.startsWith("/settings")}
            />
          </nav>
        </div>
      </SheetPopup>
    </Sheet>
  );
}
