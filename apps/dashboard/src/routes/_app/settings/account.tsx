import { createFileRoute } from "@tanstack/react-router";
import { useHydrated } from "@tanstack/react-router";
import { useTheme } from "better-themes";
import {
  IconCheckOutline18,
  IconLaptopOutline18,
  IconDarkModeOutline18,
  IconSunOutline18,
} from "nucleo-ui-outline-18";
import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";
import { cn } from "@/utils/cn";

export const Route = createFileRoute("/_app/settings/account")({
  component: RouteComponent,
});

type ThemeOption = "light" | "dark" | "system";

const themeConfig: Record<
  ThemeOption,
  { icon: typeof IconSunOutline18; label: string; description: string }
> = {
  light: { icon: IconSunOutline18, label: "Light", description: "A clean, bright appearance" },
  dark: {
    icon: IconDarkModeOutline18,
    label: "Dark",
    description: "Easy on the eyes in low light",
  },
  system: {
    icon: IconLaptopOutline18,
    label: "System",
    description: "Matches your device settings",
  },
};

const themeOptions: ThemeOption[] = ["light", "dark", "system"];

function isValidTheme(theme: string | undefined): theme is ThemeOption {
  return theme !== undefined && theme in themeConfig;
}

function RouteComponent() {
  const hydrated = useHydrated();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the application looks on your device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {themeOptions.map((themeOption) => {
              const Icon = themeConfig[themeOption].icon;
              const isActive = isValidTheme(theme) && themeOption === theme;

              return (
                <Button
                  key={themeOption}
                  variant="outline"
                  disabled={!hydrated}
                  onClick={() => setTheme(themeOption)}
                  className={cn(
                    "h-auto flex-col items-start gap-2 p-4",
                    isActive && "border-primary bg-primary/5",
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <Icon className="size-5" />
                    {isActive && <IconCheckOutline18 className="size-4 text-primary" />}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{themeConfig[themeOption].label}</div>
                    <div className="font-normal text-muted-foreground text-xs">
                      {themeConfig[themeOption].description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
