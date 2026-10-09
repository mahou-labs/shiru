import { Avatar, AvatarFallback, AvatarImage } from "@shiru/ui/components/avatar";
import {
  Menu,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from "@shiru/ui/components/menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@shiru/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import {
  IconArrowDoorOutOutlineDuo18,
  IconChevronExpandYOutlineDuo18,
  IconCircleUserOutlineDuo18,
  IconSunOutlineDuo18,
} from "nucleo-ui-outline-duo-18";

import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/initials";
import { useSession } from "@/lib/queries";

export function UserMenu() {
  const { user } = useSession();
  const { theme, setTheme } = useTheme();

  async function signOut() {
    await authClient.signOut();
    window.location.assign("/auth/sign-in");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger render={<SidebarMenuButton size="lg" />}>
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="rounded-lg">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-muted-foreground text-xs">{user.email}</span>
            </div>
            <IconChevronExpandYOutlineDuo18 className="ms-auto" />
          </MenuTrigger>
          <MenuPopup side="top" align="start" className="min-w-(--anchor-width)">
            <MenuLinkItem render={<Link to="/settings/account" />}>
              <IconCircleUserOutlineDuo18 />
              Account
            </MenuLinkItem>
            <MenuSub>
              <MenuSubTrigger>
                <IconSunOutlineDuo18 />
                Theme
              </MenuSubTrigger>
              <MenuSubPopup>
                <MenuRadioGroup value={theme} onValueChange={setTheme}>
                  <MenuRadioItem value="light">Light</MenuRadioItem>
                  <MenuRadioItem value="dark">Dark</MenuRadioItem>
                  <MenuRadioItem value="system">System</MenuRadioItem>
                </MenuRadioGroup>
              </MenuSubPopup>
            </MenuSub>
            <MenuSeparator />
            <MenuItem onClick={() => void signOut()}>
              <IconArrowDoorOutOutlineDuo18 />
              Sign out
            </MenuItem>
          </MenuPopup>
        </Menu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
