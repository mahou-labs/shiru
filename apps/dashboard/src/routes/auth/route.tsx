import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const authSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  validateSearch: zodValidator(authSearchSchema),
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden overflow-hidden bg-zinc-100 lg:flex lg:w-1/2 dark:bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute -bottom-24 left-1/4 size-64 rounded-full bg-cyan-300/10 blur-3xl dark:bg-cyan-500/5" />
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-12">
          <p className="font-semibold text-lg text-zinc-900 dark:text-white">Shiru</p>
          <div className="max-w-sm">
            <p className="font-medium text-2xl leading-relaxed text-zinc-800 dark:text-zinc-200">
              Modern hiring for teams who want full control.
            </p>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
              Open-source applicant tracking and recruitment platform.
            </p>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">&copy; 2025 Mahou Labs</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
