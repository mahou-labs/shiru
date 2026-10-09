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
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ to, label, icon: Icon }) => (
            <SidebarMenuItem key={label}>
              <SidebarMenuButton
                isActive={Boolean(matchRoute({ to }))}
                tooltip={label}
                render={<Link to={to} />}
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  return (
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
  );
}
