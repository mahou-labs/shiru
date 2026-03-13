import { orpc } from "@/utils/orpc-client";
import { Button } from "@shiru/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@shiru/ui/empty";
import { AnchoredToastProvider, ToastProvider } from "@shiru/ui/toast";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { scan } from "react-scan";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
// import { hotkeysDevtoolsPlugin } from "@tanstack/react-hotkeys-devtools";
import { ThemeProvider } from "better-themes";
import { IconCircleXmarkOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import PostHogProvider from "@/contexts/posthog-context";

type RouterAppContext = {
  orpc: typeof orpc;
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Shiru",
      },
    ],
  }),

  component: RootDocument,
  notFoundComponent: NotFoundPage,
  errorComponent: (e) => <pre>{JSON.stringify(e, null, 2)}</pre>,
});

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

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="h-svh">
        <PostHogProvider>
          <ThemeProvider attribute="class" disableTransitionOnChange>
            <ToastProvider>
              <AnchoredToastProvider>
                <Outlet />
              </AnchoredToastProvider>
            </ToastProvider>
          </ThemeProvider>
        </PostHogProvider>

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
        <Scripts />
      </body>
    </html>
  );
}
