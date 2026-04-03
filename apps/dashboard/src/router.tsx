import { toastManager } from "@shiru/ui/toast";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import { createRouter } from "@tanstack/react-router";

import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
import { orpc } from "./utils/orpc-client";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
    queryCache: new QueryCache({
      onError: (_error, query) => {
        toastManager.add({
          type: "error",
          title: "Something went wrong",
          actionProps: {
            children: "retry",
            onClick: () => {
              query.reset();
              void query.fetch();
            },
          },
        });
      },
    }),
  });

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: () => <Loader />,
    defaultNotFoundComponent: () => <div>Not Found</div>,
    context: { orpc, queryClient },
    defaultPreload: "intent",
    Wrap: ({ children }) => {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
