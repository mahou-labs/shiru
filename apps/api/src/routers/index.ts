import type { RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "../utils/orpc";
import { domainRouter } from "./domain-router";
import { onboardingRouter } from "./onboarding-router";
import { orgInviteRouter } from "./orgInvites";
import { organizationRouter } from "./organization";
// import { uploadRouter } from "./upload";
import { userRouter } from "./user";
import { waitlistRouter } from "./waitlist";

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
  orgInvite: orgInviteRouter,
  // upload: uploadRouter,
  user: userRouter,
  waitlist: waitlistRouter,
};

export type AppRouterClient = RouterClient<typeof appRouter>;
