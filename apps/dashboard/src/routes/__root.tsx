import { Button } from "@shiru/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shiru/ui/components/empty";
import { ToastProvider } from "@shiru/ui/components/toast";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Link,
  Outlet,
  createRootRouteWithContext,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  IconAlertWarningOutlineDuo18,
  IconCircleXmarkOutlineDuo18,
} from "nucleo-ui-outline-duo-18";

import PostHogProvider from "@/components/posthog-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { errorMessage } from "@/lib/errors";
import type { orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorPage,
  head: () => ({
    meta: [{ title: "Shiru" }],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <PostHogProvider>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
          <ToastProvider>
            <Outlet />
          </ToastProvider>
        </ThemeProvider>
      </PostHogProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </>
  );
}

function NotFound() {
  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconCircleXmarkOutlineDuo18 />
        </EmptyMedia>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>The page you're looking for doesn't exist or has moved.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link to="/" />}>Go to dashboard</Button>
      </EmptyContent>
    </Empty>
  );
}

function ErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconAlertWarningOutlineDuo18 />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>{errorMessage(error)}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button render={<Link to="/" />}>Go to dashboard</Button>
      </EmptyContent>
    </Empty>
  );
}
