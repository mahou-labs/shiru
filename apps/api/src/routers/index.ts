import type { RouterClient } from "@orpc/server";

import { getOrganizationAccess } from "../utils/billing";
import { authedProcedure, organizationProcedure, publicProcedure } from "../utils/orpc";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  privateData: authedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.user,
  })),
  subscription: organizationProcedure.handler(({ context }) =>
    getOrganizationAccess(context.organizationId),
  ),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
