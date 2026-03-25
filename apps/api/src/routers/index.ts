import type { RouterClient } from "@orpc/server";
import { publicProcedure } from "../utils/orpc";
import { onboardingRouter } from "./onboarding-router";
import { organizationRouter } from "./organization-router";
import { userRouter } from "./user-router";
import { waitlistRouter } from "./waitlist-router";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  onboarding: onboardingRouter,
  organization: organizationRouter,
  user: userRouter,
  waitlist: waitlistRouter,
};

export type AppRouterClient = RouterClient<typeof appRouter>;
