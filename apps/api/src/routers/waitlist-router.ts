import { ORPCError } from "@orpc/server";
import z from "zod";

import { waitlist } from "@/schema/waitlist";
import { db } from "@/utils/db";
import { log } from "@/utils/logger";
import { tryCatch } from "@/utils/try-catch";

import { publicProcedure } from "../utils/orpc";

export const waitlistRouter = {
  addEmail: publicProcedure.input(z.object({ email: z.email() })).handler(async ({ input }) => {
    const { error } = await tryCatch(
      db.insert(waitlist).values({
        email: input.email,
      }),
    );

    if (error) {
      log.error("waitlist.add_email_failed", error, { email: input.email });
      throw new ORPCError("Failed to add email to waitlist");
    }

    return { success: true };
  }),
};
