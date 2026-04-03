import { Button } from "@shiru/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@shiru/ui/empty";
import { AnchoredToastProvider, ToastProvider } from "@shiru/ui/toast";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "better-themes";
import {
  IconAlertWarningOutlineDuo18,
  IconCircleXmarkOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { scan } from "react-scan";

import PostHogProvider from "@/contexts/posthog-context";
import { orpc } from "@/utils/orpc-client";

type RouterAppContext = {
  orpc: typeof orpc;
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-svh items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconAlertWarningOutlineDuo18 />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>{error.message || "An unexpected error occurred."}</EmptyDescription>
        </EmptyHeader>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
          <Button render={<Link to="/" />}>Go to Dashboard</Button>
        </div>
      </Empty>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex h-svh items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconCircleXmarkOutlineDuo18 />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you're looking for doesn't exist or has been moved.
          </EmptyDescription>
        </EmptyHeader>
        <Button render={<Link to="/" />}>Go to Dashboard</Button>
      </Empty>
    </div>
  );
}

if (typeof window !== "undefined") {
  scan({
    enabled: import.meta.env.DEV,
  });
}

function RootComponent() {
  return (
    <>
      <div className="h-svh antialiased">
        <PostHogProvider>
          {/*<UserJotProvider>*/}
          <ThemeProvider attribute="class" disableTransitionOnChange>
            <ToastProvider>
              <AnchoredToastProvider>
                <Outlet />
              </AnchoredToastProvider>
            </ToastProvider>
          </ThemeProvider>
          {/*</UserJotProvider>*/}
        </PostHogProvider>
      </div>

      <TanStackDevtools
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          formDevtoolsPlugin(),
          // hotkeysDevtoolsPlugin(),
        ]}
      />
    </>
  );
}
