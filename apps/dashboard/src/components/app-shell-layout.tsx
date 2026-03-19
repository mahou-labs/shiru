import type { ReactNode } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useSidebar } from "@/contexts/sidebar-context";
import { AppHeader } from "./app-header";
import { MobileContextPanel } from "./mobile-context-panel";
import { MobileSidebar } from "./mobile-sidebar";
import { SecondarySidebar } from "./secondary-sidebar";

export type SecondarySidebarKind = "navigation" | "workspace" | "actions";
export type SecondarySidebarMobileMode = "nav-section" | "sheet";

export type AppShellSecondarySidebar = {
  content: ReactNode;
  desktopWidth?: number;
  kind: SecondarySidebarKind;
  mobileContent?: ReactNode;
  mobileMode: SecondarySidebarMobileMode;
  title: string;
};

type AppShellLayoutProps = {
  children: ReactNode;
  secondarySidebar?: AppShellSecondarySidebar;
};

export function AppShellLayout({ children, secondarySidebar }: AppShellLayoutProps) {
  const { toggleSecondarySidebar } = useSidebar();
  const hasSecondarySidebar = secondarySidebar !== undefined;

  useHotkey("Mod+\\", () => {
    if (hasSecondarySidebar) {
      toggleSecondarySidebar();
    }
  });

  return (
    <>
      <div className="flex h-full min-w-0 flex-1 overflow-hidden">
        {secondarySidebar && (
          <SecondarySidebar
            desktopWidth={secondarySidebar.desktopWidth}
            kind={secondarySidebar.kind}
            title={secondarySidebar.title}
          >
            {secondarySidebar.content}
          </SecondarySidebar>
        )}

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader secondarySidebar={secondarySidebar} />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>

      <MobileSidebar secondarySidebar={secondarySidebar} />
      <MobileContextPanel secondarySidebar={secondarySidebar} />
    </>
  );
}
