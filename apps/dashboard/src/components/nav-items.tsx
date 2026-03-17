import type { ToOptions } from "@tanstack/react-router";
import {
  IconBookOpen2OutlineDuo18,
  IconGearOutlineDuo18,
  IconHouse2OutlineDuo18,
} from "nucleo-ui-outline-duo-18";

export type NavItem = {
  icon: React.FC<{ className?: string }>;
  label: string;
  href: ToOptions["to"];
  matchPath: (pathname: string) => boolean;
  /** Push to the bottom of the nav with mt-auto separator */
  bottom?: boolean;
};

export const navItems: NavItem[] = [
  {
    icon: IconHouse2OutlineDuo18,
    label: "Dashboard",
    href: "/",
    matchPath: (pathname) => pathname === "/",
  },
  {
    icon: IconBookOpen2OutlineDuo18,
    label: "Editor",
    href: "/editor",
    matchPath: (pathname) => pathname.startsWith("/editor"),
  },
  {
    icon: IconGearOutlineDuo18,
    label: "Settings",
    href: "/settings",
    matchPath: (pathname) => pathname.startsWith("/settings"),
    bottom: true,
  },
];
