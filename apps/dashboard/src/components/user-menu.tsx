import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouteContext, useRouter } from "@tanstack/react-router";
import { IconChevronDownOutline18 } from "nucleo-ui-outline-18";
import { useSidebar } from "@/contexts/sidebar-context";
import { authClient } from "@/utils/auth-client";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/initials";
import { Avatar, AvatarFallback, AvatarImage } from "@shiru/ui/avatar";
import { Menu, MenuItem, MenuPopup, MenuPortal, MenuSeparator, MenuTrigger } from "@shiru/ui/menu";

export function UserMenu() {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useRouteContext({ from: "/_app" });

  const signOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    await router.invalidate();
  };

  return (
    <Menu>
      <MenuTrigger className="flex cursor-pointer select-none items-center gap-2 rounded-lg">
        <Avatar>
          <AvatarImage src={user?.image ?? undefined} />
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>

        <div
          className={cn(
            "flex min-w-0 flex-col items-start overflow-hidden transition-opacity duration-300",
            isCollapsed && "opacity-0",
          )}
        >
          <span className="w-full truncate text-start font-semibold text-foreground text-sm">
            {user?.name}
          </span>
          <span className="w-full truncate text-start text-foreground-muted text-xs">
            {user?.email}
          </span>
        </div>

        <IconChevronDownOutline18
          className={cn(
            "ml-auto size-3 shrink-0 text-foreground-muted",
            isCollapsed && "opacity-0",
          )}
        />
      </MenuTrigger>

      <MenuPortal>
        <MenuPopup>
          <MenuItem onClick={() => navigate({ to: "/settings/account" })}>Settings</MenuItem>
          <MenuSeparator />
          <MenuItem>Favorite</MenuItem>
          <MenuItem onClick={signOut}>Sign Out</MenuItem>
        </MenuPopup>
      </MenuPortal>
    </Menu>
  );
}
