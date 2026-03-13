import { useModifierKey } from "@/hooks/use-modifier-key";
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
import { useHotkey } from "@tanstack/react-hotkeys";
import {
  IconArrowCornerBottomLeftOutline18,
  IconChevronDownOutline18,
  IconChevronUpOutline18,
  IconMagnifierOutline18,
} from "nucleo-ui-outline-18";
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

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const modifierKey = useModifierKey();
  useHotkey("Mod+K", () => setOpen((open) => !open));

  function handleItemClick(_item: Item) {
    setOpen(false);
  }

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandDialogTrigger
        render={
          <Button
            variant="ghost"
            className="h-8 ml-auto w-full max-w-3xs justify-start gap-3 px-1.75 text-muted-foreground outline-solid outline outline-border hover:bg-transparent"
          />
        }
      >
        <IconMagnifierOutline18 className="size-4 shrink-0" />
        <div className="flex flex-1 items-center justify-between">
          <span>Search...</span>
          <KbdGroup>
            <Kbd>{modifierKey}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>
      </CommandDialogTrigger>
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
                    <IconChevronUpOutline18 />
                  </Kbd>
                  <Kbd>
                    <IconChevronDownOutline18 />
                  </Kbd>
                </KbdGroup>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>
                  <IconArrowCornerBottomLeftOutline18 />
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
