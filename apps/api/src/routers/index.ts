import type { RouterClient } from "@orpc/server";
import { z } from "zod";

import { waitlistEntries } from "../schema/waitlist";
import { getOrganizationAccess } from "../utils/billing";
import { db } from "../utils/db";
import { authedProcedure, organizationProcedure, publicProcedure } from "../utils/orpc";
import { docsRouter } from "./docs";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  privateData: authedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.user,
  })),
  subscription: organizationProcedure.handler(({ context }) =>
    getOrganizationAccess(context.organizationId),
  ),
  docs: docsRouter,
  waitlist: {
    join: publicProcedure
      .input(z.object({ email: z.string().trim().toLowerCase().pipe(z.email()) }))
      .handler(async ({ input }) => {
        await db
          .insert(waitlistEntries)
          .values({ email: input.email, createdAt: new Date() })
          .onConflictDoNothing();
        return { joined: true as const };
      }),
  },
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
