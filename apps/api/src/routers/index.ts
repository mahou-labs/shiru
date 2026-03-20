import type { RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "../utils/orpc";
import { domainRouter } from "./domain-router";
import { onboardingRouter } from "./onboarding-router";
import { organizationRouter } from "./organization-router";
import { userRouter } from "./user-router";
import { waitlistRouter } from "./waitlist-router";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.user,
    };
  }),
  domain: domainRouter,
  onboarding: onboardingRouter,
  organization: organizationRouter,
  user: userRouter,
  waitlist: waitlistRouter,
};

export type AppRouterClient = RouterClient<typeof appRouter>;
