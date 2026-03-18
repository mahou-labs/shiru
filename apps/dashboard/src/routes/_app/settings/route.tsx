import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Page } from "@/components/page";
import { SettingsSecondaryNav } from "@/components/settings-secondary-nav";
import { useSecondarySidebar } from "@/components/use-secondary-sidebar";
import { secondarySidebarDesktopWidth, type SecondarySidebarConfig } from "@/contexts/sidebar-context";

export const Route = createFileRoute("/_app/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const secondarySidebar: SecondarySidebarConfig = {
    id: "settings",
    title: "Settings",
    kind: "navigation",
    desktopWidth: secondarySidebarDesktopWidth,
    mobileMode: "nav-section",
    collapsePrimaryByDefault: true,
    content: <SettingsSecondaryNav />,
    mobileContent: <SettingsSecondaryNav as="div" />,
  };

  useSecondarySidebar(secondarySidebar);

  return (
    <Page title="Settings" description="Manage your account and organization settings">
      <Outlet />
    </Page>
  );
}
