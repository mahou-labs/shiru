import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { LoadingScreen } from "@/components/loading-screen";
import { MobileContextPanel } from "@/components/mobile-context-panel";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { SecondarySidebarHost } from "@/components/secondary-sidebar";
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

  return (
    <SidebarProvider>
      <main className="flex h-full overflow-hidden bg-background">
        <Sidebar />
        <SecondarySidebarHost />
        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader />
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </main>
      <MobileSidebar />
      <MobileContextPanel />
    </SidebarProvider>
  );
}
