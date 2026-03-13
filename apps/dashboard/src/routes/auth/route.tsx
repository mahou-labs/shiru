import { LoadingScreen } from "@/components/loading-screen";
import { orpc } from "@/utils/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const authSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  validateSearch: zodValidator(authSearchSchema),
});

function RouteComponent() {
  const { data: session, isPending } = useQuery(
    orpc.user.getSession.queryOptions({ staleTime: Infinity }),
  );

  if (isPending) return <LoadingScreen />;

  if (session) return <Navigate to="/" />;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-sidebar p-4 sm:p-6">
      {/* Subtle radial gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-background)_0%,transparent_60%)]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        {/* Logo */}
        <div className="mb-8">
          <p className="font-heading font-semibold text-xl text-foreground">Shiru</p>
        </div>

        {/* Auth card */}
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} Mahou Labs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
