import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { LoadingScreen } from "@/components/loading-screen";
import { MobileSidebar } from "@/components/mobile-sidebar";
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
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <AppHeader />
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </main>
      <MobileSidebar />
    </SidebarProvider>
  );
}
