import { useMetaKey } from "@/hooks/use-modifier-key";
import { cn } from "@/utils/cn";
import { Button } from "@shiru/ui/button";
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
} from "@shiru/ui/command";
import { Kbd, KbdGroup } from "@shiru/ui/kbd";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@shiru/ui/tooltip";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
  IconArrowCornerBottomLeftOutlineDuo18,
  IconChevronDownOutlineDuo18,
  IconChevronUpOutlineDuo18,
  IconMagnifierOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { Fragment, useState } from "react";

type Item = {
  value: string;
  label: string;
  shortcut?: string;
};

type Group = {
  value: string;
  items: Item[];
};

const suggestions: Item[] = [
  { label: "Linear", shortcut: "⌘L", value: "linear" },
  { label: "Figma", shortcut: "⌘F", value: "figma" },
  { label: "Slack", shortcut: "⌘S", value: "slack" },
  { label: "YouTube", shortcut: "⌘Y", value: "youtube" },
  { label: "Raycast", shortcut: "⌘R", value: "raycast" },
];

const commands: Item[] = [
  { label: "Clipboard History", shortcut: "⌘⇧C", value: "clipboard-history" },
  { label: "Import Extension", shortcut: "⌘I", value: "import-extension" },
  { label: "Create Snippet", shortcut: "⌘N", value: "create-snippet" },
  { label: "System Preferences", shortcut: "⌘,", value: "system-preferences" },
  { label: "Window Management", shortcut: "⌘⇧W", value: "window-management" },
];

const groupedItems: Group[] = [
  { items: suggestions, value: "Suggestions" },
  { items: commands, value: "Commands" },
];

type SearchBarProps = {
  isCollapsed?: boolean;
};

export function SearchBar({ isCollapsed }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const metaKey = useMetaKey();
  useHotkey("Mod+K", () => setOpen((prev) => !prev));

  function handleItemClick(_item: Item) {
    setOpen(false);
  }

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <Tooltip disabled={!isCollapsed}>
        <TooltipTrigger
          render={
            <CommandDialogTrigger
              render={
                <Button
                  variant="ghost"
                  className="h-8 w-full justify-start gap-3 px-2 text-muted-foreground border border-sidebar-border bg-background hover:bg-background"
                />
              }
            >
              <IconMagnifierOutlineDuo18 className="size-4 shrink-0" />
              <div
                className={cn(
                  "flex flex-1 items-center justify-between overflow-hidden transition-opacity duration-200",
                  isCollapsed ? "opacity-0" : "opacity-100",
                )}
              >
                <span>Search</span>
                <KbdGroup>
                  <Kbd>{metaKey}</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </div>
            </CommandDialogTrigger>
          }
        />
        <TooltipPopup side="right">
          <span>Search</span>
        </TooltipPopup>
      </Tooltip>
      <CommandDialogPopup>
        <Command items={groupedItems}>
          <CommandInput placeholder="Search for apps and commands..." />
          <CommandPanel>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
              {(group: Group, _index: number) => (
                <Fragment key={group.value}>
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.value}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: Item) => (
                        <CommandItem
                          key={item.value}
                          onClick={() => handleItemClick(item)}
                          value={item.value}
                        >
                          <span className="flex-1">{item.label}</span>
                          {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                        </CommandItem>
                      )}
                    </CommandCollection>
                  </CommandGroup>
                  <CommandSeparator />
                </Fragment>
              )}
            </CommandList>
          </CommandPanel>
          <CommandFooter>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <KbdGroup>
                  <Kbd>
                    <IconChevronUpOutlineDuo18 />
                  </Kbd>
                  <Kbd>
                    <IconChevronDownOutlineDuo18 />
                  </Kbd>
                </KbdGroup>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>
                  <IconArrowCornerBottomLeftOutlineDuo18 />
                </Kbd>
                <span>Open</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Kbd>Esc</Kbd>
              <span>Close</span>
            </div>
          </CommandFooter>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  );
}
