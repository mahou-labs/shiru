import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Page } from "@/components/page";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@shiru/ui/tabs";

export const Route = createFileRoute("/_app/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the current tab from the pathname
  const getActiveTab = () => {
    const pathSegments = location.pathname.split("/");
    const lastSegment = pathSegments.at(-1);

    // If we're at /settings (base route), show overview as active
    if (lastSegment === "settings") {
      return "overview";
    }

    // Otherwise return the last segment (account, organization, etc.)
    return lastSegment;
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: "overview", label: "Overview", to: "/settings" },
    { id: "organization", label: "Organization", to: "/settings/organization" },
    { id: "account", label: "Account", to: "/settings/account" },
  ];

  // Handle tab changes and navigate to corresponding route
  const handleTabChange = (value: string) => {
    const tab = tabs.find((t) => t.id === value);
    if (tab) {
      navigate({ to: tab.to });
    }
  };

  return (
    <Page title="Settings" description="Manage your account and organization settings">
      <Tabs onValueChange={handleTabChange} value={activeTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTab key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTab>
          ))}
        </TabsList>

        <TabsPanel value={activeTab}>
          <Outlet />
        </TabsPanel>
      </Tabs>
    </Page>
  );
}
