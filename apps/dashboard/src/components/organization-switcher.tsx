import { Avatar, AvatarFallback, AvatarImage } from "@shiru/ui/components/avatar";
import {
  Dialog,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@shiru/ui/components/dialog";
import { Menu, MenuItem, MenuPopup, MenuSeparator, MenuTrigger } from "@shiru/ui/components/menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@shiru/ui/components/sidebar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconCheckOutlineDuo18,
  IconChevronExpandYOutlineDuo18,
  IconCirclePlusOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useState } from "react";

import { accessLabel } from "@/lib/access";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/initials";
import { accessQuery, organizationsQuery, useSession } from "@/lib/queries";

import { CreateOrganizationForm } from "./create-organization-form";

export function OrganizationSwitcher() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const { data: organizations = [] } = useQuery(organizationsQuery);
  const { data: access } = useQuery(accessQuery);
  const active = organizations.find(
    (organization) => organization.id === session.session.activeOrganizationId,
  );

  const switchTo = useMutation({
    mutationFn: (organizationId: string) => authClient.organization.setActive({ organizationId }),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger render={<SidebarMenuButton size="lg" />}>
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={active?.logo ?? undefined} />
              <AvatarFallback className="rounded-lg">{initials(active?.name ?? "")}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-medium">{active?.name}</span>
              <span className="truncate text-muted-foreground text-xs">
                {access && accessLabel(access)}
              </span>
            </div>
            <IconChevronExpandYOutlineDuo18 className="ms-auto" />
          </MenuTrigger>
          <MenuPopup align="start" className="min-w-(--anchor-width)">
            {organizations.map((organization) => (
              <MenuItem key={organization.id} onClick={() => switchTo.mutate(organization.id)}>
                <Avatar className="size-5 rounded-md text-[0.625rem]">
                  <AvatarImage src={organization.logo ?? undefined} />
                  <AvatarFallback className="rounded-md">
                    {initials(organization.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{organization.name}</span>
                {organization.id === active?.id && <IconCheckOutlineDuo18 />}
              </MenuItem>
            ))}
            <MenuSeparator />
            <MenuItem onClick={() => setCreating(true)}>
              <IconCirclePlusOutlineDuo18 />
              New organization
            </MenuItem>
          </MenuPopup>
        </Menu>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogPopup className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New organization</DialogTitle>
            </DialogHeader>
            <DialogPanel>
              <CreateOrganizationForm onCreated={() => setCreating(false)} />
            </DialogPanel>
          </DialogPopup>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
