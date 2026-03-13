import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@shiru/ui/button";
import { Separator } from "@shiru/ui/separator";
import { IconMenuBarsOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { NotificationsButton } from "./notifications-button";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";

export function AppHeader() {
  const { setMobileOpen } = useSidebar();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-sidebar px-4">
      <Button
        size="icon"
        variant="ghost"
        className="lg:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
      >
        <IconMenuBarsOutlineDuo18 className="size-4" />
      </Button>

      <Separator orientation="vertical" className="h-5 lg:hidden" />

      <div className="flex max-w-md flex-1">
        <SearchBar />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <NotificationsButton />
        <UserMenu />
      </div>
    </header>
  );
}
