import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import {
  IconArrowDoorOutOutlineDuo18,
  IconGearOutlineDuo18,
  IconUsersOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { authClient } from "@/utils/auth-client";
import { getInitials } from "@/utils/initials";
import { orpc } from "@/utils/orpc-client";
import { Avatar, AvatarFallback, AvatarImage } from "@shiru/ui/avatar";
import { Menu, MenuItem, MenuPopup, MenuPortal, MenuSeparator, MenuTrigger } from "@shiru/ui/menu";

export function UserMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session } = useQuery(orpc.user.getSession.queryOptions());
  const user = session?.user;

  const signOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    await router.invalidate();
    await navigate({ to: "/auth/signin" });
  };

  return (
    <Menu>
      <MenuTrigger className="cursor-pointer select-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar>
          <AvatarImage src={user?.image ?? undefined} />
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
      </MenuTrigger>

      <MenuPortal>
        <MenuPopup>
          <MenuItem onClick={() => navigate({ to: "/settings/account" })}>
            <IconGearOutlineDuo18 className="size-4" />
            Account Settings
          </MenuItem>
          <MenuItem onClick={() => navigate({ to: "/settings/organization" })}>
            <IconUsersOutlineDuo18 className="size-4" />
            Organization
          </MenuItem>
          <MenuSeparator />
          <MenuItem variant="destructive" onClick={signOut}>
            <IconArrowDoorOutOutlineDuo18 className="size-4" />
            Sign Out
          </MenuItem>
        </MenuPopup>
      </MenuPortal>
    </Menu>
  );
}
