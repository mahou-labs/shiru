import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { sessionQuery } from "@/lib/queries";
import { redirectSearch } from "@/lib/redirect";

export const Route = createFileRoute("/auth")({
  validateSearch: redirectSearch,
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.fetchQuery(sessionQuery);
    if (session) throw redirect({ href: search.redirect ?? "/" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-sidebar p-4">
      <p className="font-heading font-semibold text-lg">Shiru</p>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
