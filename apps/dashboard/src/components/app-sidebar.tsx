import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@shiru/ui/components/sidebar";
import { TooltipProvider } from "@shiru/ui/components/tooltip";
import { Link, useMatchRoute, type LinkProps } from "@tanstack/react-router";
import {
  IconCircleUserOutlineDuo18,
  IconCreditCardOutlineDuo18,
  IconHouse2OutlineDuo18,
  IconUsersOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import type { ComponentType } from "react";

import { OrganizationSwitcher } from "./organization-switcher";
import { UserMenu } from "./user-menu";

type NavItem = { to: LinkProps["to"]; label: string; icon: ComponentType };

const workspace: NavItem[] = [{ to: "/", label: "Dashboard", icon: IconHouse2OutlineDuo18 }];

const settings: NavItem[] = [
  { to: "/settings/account", label: "Account", icon: IconCircleUserOutlineDuo18 },
  { to: "/settings/organization", label: "Organization", icon: IconUsersOutlineDuo18 },
  { to: "/settings/billing", label: "Billing", icon: IconCreditCardOutlineDuo18 },
];

function NavGroup({ label, items }: { label?: string; items: NavItem[] }) {
  const matchRoute = useMatchRoute();

  return (
    // Collapsed, the hidden section label leaves a thin rule centered in the gap above the group.
    <SidebarGroup
      className={
        label
          ? "before:pointer-events-none before:absolute before:inset-x-3 before:-top-1 before:h-px before:bg-sidebar-border before:opacity-0 before:transition-opacity before:duration-180 before:ease-out group-data-[collapsible=icon]:before:opacity-100"
          : undefined
      }
    >
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ to, label: itemLabel, icon: Icon }) => (
            <SidebarMenuItem key={itemLabel}>
              <SidebarMenuButton
                isActive={Boolean(matchRoute({ to }))}
                tooltip={{ children: <Legend section={label} name={itemLabel} /> }}
                render={<Link to={to} />}
              >
                <Icon />
                <span>{itemLabel}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function Legend({ section, name }: { section?: string; name: string }) {
  if (!section) return name;
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{section}</span>
      <span aria-hidden className="text-muted-foreground/60">
        /
      </span>
      {name}
    </span>
  );
}

export function AppSidebar() {
  return (
    // Legends appear on the first hover with no delay, and each next item opens instantly.
    <TooltipProvider delay={0} closeDelay={0}>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <OrganizationSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <NavGroup items={workspace} />
          <NavGroup label="Settings" items={settings} />
        </SidebarContent>
        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
