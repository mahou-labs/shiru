import { Button } from "@shiru/ui/button";
import { IconBellOutlineDuo18 } from "nucleo-ui-outline-duo-18";

export function NotificationsButton() {
  return (
    <Button size="icon" variant="ghost" aria-label="Notifications">
      <IconBellOutlineDuo18 className="size-4" />
    </Button>
  );
}
