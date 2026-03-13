import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
// import { useWindowSize } from "@uidotdev/usehooks";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";
// import { orpc } from "@/utils/orpc-client";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/signin" });
    }

    if (!context.session.activeOrganizationId) {
      throw redirect({ to: "/onboarding" });
    }
  },
  loader: ({ context }) => {
    // void context.queryClient.ensureQueryData(orpc.organization.getOrgList.queryOptions());
  },
});

function RouteComponent() {
  // const { width } = useWindowSize();

  // if (width && width < 1024) {
  //   return <Outlet />;
  // }

  return (
    <SidebarProvider>
      <main className="flex h-full overflow-hidden bg-background">
        <Sidebar />
        <div className="h-full overflow-y-auto grow">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
