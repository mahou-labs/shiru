import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

import { LoadingScreen } from "@/components/loading-screen";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { orpc } from "@/utils/orpc-client";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = useQuery(
    orpc.user.getSession.queryOptions({ staleTime: Infinity }),
  );

  if (isPending) return <LoadingScreen />;
  if (!session) return <Navigate to="/auth/signin" />;

  // Users without an active organization must complete onboarding first
  if (!session.session.activeOrganizationId) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <SidebarProvider>
      <main className="flex h-full overflow-hidden bg-sidebar">
        <Sidebar />
        <div className="flex-1 border border-border bg-background drop-shadow-xs lg:m-2 lg:ml-0 lg:rounded-xl">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
