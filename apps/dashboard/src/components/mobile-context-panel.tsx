import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@shiru/ui/sheet";
import { useSidebar } from "@/contexts/sidebar-context";
import type { AppShellSecondarySidebar } from "./app-shell-layout";

const kindDescriptions = {
  navigation: "Browse this screen without leaving the current workspace.",
  workspace: "Keep structure, files, and writing aids close to the canvas.",
  actions: "Open contextual actions without interrupting your flow.",
} as const;

export function MobileContextPanel({
  secondarySidebar,
}: {
  secondarySidebar?: AppShellSecondarySidebar;
}) {
  const { mobilePanel, setMobilePanel } = useSidebar();

  if (!secondarySidebar || secondarySidebar.mobileMode !== "sheet") {
    return null;
  }

  return (
    <Sheet
      open={mobilePanel === "secondary"}
      onOpenChange={(open) => setMobilePanel(open ? "secondary" : null)}
    >
      <SheetPopup
        side="right"
        className="w-80 max-w-[calc(100%-2rem)] rounded-none before:rounded-none sm:before:rounded-none"
      >
        <SheetHeader className="border-b border-border bg-background/95 pb-4">
          <SheetTitle>{secondarySidebar.title}</SheetTitle>
          <SheetDescription>{kindDescriptions[secondarySidebar.kind]}</SheetDescription>
        </SheetHeader>

        <SheetPanel className="px-4 py-4">
          {secondarySidebar.mobileContent ?? secondarySidebar.content}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}
