import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppShellLayout } from "@/components/app-shell-layout";
import { DocsSecondaryNav } from "@/components/docs-secondary-nav";
import { Page } from "@/components/page";
import { secondarySidebarDesktopWidth } from "@/contexts/sidebar-context";

export const Route = createFileRoute("/_app/docs")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppShellLayout
      secondarySidebar={{
        title: "Docs",
        kind: "navigation",
        desktopWidth: secondarySidebarDesktopWidth,
        mobileMode: "nav-section",
        content: <DocsSecondaryNav />,
        mobileContent: <DocsSecondaryNav as="div" />,
      }}
    >
      <Page title="Docs" description="Publish and manage your documentation site">
        <Outlet />
      </Page>
    </AppShellLayout>
  );
}
