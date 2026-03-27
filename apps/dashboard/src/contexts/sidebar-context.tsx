import { useHotkey } from "@tanstack/react-hotkeys";
import { useLocation } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type SecondarySidebarKind = "navigation" | "workspace" | "actions";
export type SecondarySidebarMobileMode = "nav-section" | "sheet";
export const secondarySidebarDesktopWidth = 304;

type MobilePanel = "primary" | "secondary" | null;

type SidebarContextValue = {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  isSecondaryCollapsed: boolean;
  setIsSecondaryCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleSecondarySidebar: () => void;
  mobilePanel: MobilePanel;
  setMobilePanel: (value: MobilePanel) => void;
  isMobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSecondaryCollapsed, setIsSecondaryCollapsed] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const location = useLocation();

  useHotkey("Mod+B", () => setIsCollapsed((prev) => !prev), {
    ignoreInputs: true,
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleSecondarySidebar = () => {
    setIsSecondaryCollapsed((prev) => !prev);
  };

  const setMobileOpen = (value: boolean) => {
    setMobilePanel((prev) => {
      if (value) return "primary";
      return prev === "primary" ? null : prev;
    });
  };

  // Auto-close mobile panels on route change
  useEffect(() => {
    setMobilePanel(null);
  }, [location.pathname]);

  const value = {
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
    isSecondaryCollapsed,
    setIsSecondaryCollapsed,
    toggleSecondarySidebar,
    mobilePanel,
    setMobilePanel,
    isMobileOpen: mobilePanel === "primary",
    setMobileOpen,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
