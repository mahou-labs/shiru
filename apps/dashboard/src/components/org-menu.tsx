import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IconCheckOutlineDuo18,
  IconChevronDownOutlineDuo18,
  IconCirclePlusOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@shiru/ui/avatar";
import { Menu, MenuItem, MenuPopup, MenuPortal, MenuSeparator, MenuTrigger } from "@shiru/ui/menu";
import { Skeleton } from "@shiru/ui/skeleton";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/initials";
import { orpc } from "@/utils/orpc-client";
import { CreateOrgDialog } from "./create-org-dialog";

export function OrgMenu({ collapsed }: { collapsed?: boolean }) {
  const { isCollapsed } = useSidebar();
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const { data: sessionData } = useQuery(orpc.user.getSession.queryOptions());
  const session = sessionData?.session;
  const isMenuCollapsed = collapsed ?? isCollapsed;

  const { data: orgs } = useQuery(orpc.organization.getOrgList.queryOptions());
  const { mutateAsync: setActiveOrganization } = useMutation(
    orpc.organization.setActive.mutationOptions({
      onSuccess: () => {
        window.location.reload();
      },
    }),
  );

  const activeOrg = orgs?.find((org) => org.id === session?.activeOrganizationId);

  const { data: subscription, isPending } = useQuery(
    orpc.organization.getSubscription.queryOptions(),
  );

  const handleOrgChange = async (id: string) => {
    await setActiveOrganization({ organizationId: id });
  };

  const subscriptionLabel = subscription?.status === "active" ? "Active" : "Free Trial";

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="size-10 rounded-md" />
        <div
          className={cn(
            "flex flex-col gap-1.5 transition-opacity duration-300",
            isMenuCollapsed && "opacity-0",
          )}
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="ml-auto size-4" />
      </div>
    );
  }

  return (
    <Menu>
      <MenuTrigger className="flex cursor-pointer select-none items-center gap-2 rounded-lg">
        <Avatar className="rounded-md">
          <AvatarImage src={activeOrg?.logo ?? undefined} />
          <AvatarFallback className="rounded-md">{getInitials(activeOrg?.name)}</AvatarFallback>
        </Avatar>

        <div
          className={cn(
            "flex min-w-0 flex-col items-start overflow-hidden transition-opacity duration-300",
            isMenuCollapsed && "opacity-0",
          )}
        >
          <span className="w-full truncate text-start font-semibold text-foreground text-sm">
            {activeOrg?.name}
          </span>
          <span className="w-full truncate text-start text-foreground-muted text-xs">
            {subscriptionLabel}
          </span>
        </div>

        <IconChevronDownOutlineDuo18
          className={cn(
            "ml-auto size-3 shrink-0 text-foreground-muted transition-opacity",
            isMenuCollapsed && "opacity-0",
          )}
        />
      </MenuTrigger>

      <MenuPortal>
        <MenuPopup>
          {orgs?.map((org) => (
            <MenuItem key={org.id} onClick={() => handleOrgChange(org.id)}>
              <Avatar className="size-4 rounded-sm text-[8px]">
                <AvatarImage src={org.logo ?? undefined} />
                <AvatarFallback className="rounded-sm">{getInitials(org.name)}</AvatarFallback>
              </Avatar>
              <span className="flex-1">{org.name}</span>
              {org.id === session?.activeOrganizationId && (
                <IconCheckOutlineDuo18 className="size-4" />
              )}
            </MenuItem>
          ))}

          <MenuSeparator />

          <MenuItem onClick={() => setIsCreateOrgDialogOpen(true)}>
            <IconCirclePlusOutlineDuo18 className="size-4" />
            <span>Create Organization</span>
          </MenuItem>
        </MenuPopup>
      </MenuPortal>

      <CreateOrgDialog
        allowClosing
        isOpen={isCreateOrgDialogOpen}
        onOpenChange={setIsCreateOrgDialogOpen}
        onSuccess={() => {
          setIsCreateOrgDialogOpen(false);
        }}
      />
    </Menu>
  );
}
