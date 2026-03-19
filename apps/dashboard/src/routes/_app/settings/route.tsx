import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShellLayout } from "@/components/app-shell-layout";
import { Page } from "@/components/page";
import { SettingsSecondaryNav } from "@/components/settings-secondary-nav";
import { secondarySidebarDesktopWidth } from "@/contexts/sidebar-context";

export const Route = createFileRoute("/_app/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppShellLayout
      secondarySidebar={{
        title: "Settings",
        kind: "navigation",
        desktopWidth: secondarySidebarDesktopWidth,
        mobileMode: "nav-section",
        content: <SettingsSecondaryNav />,
        mobileContent: <SettingsSecondaryNav as="div" />,
      }}
    >
      <Page title="Settings" description="Manage your account and organization settings">
        <Outlet />
      </Page>
    </AppShellLayout>
  );
}
