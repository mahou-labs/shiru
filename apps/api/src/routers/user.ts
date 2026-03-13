import { auth } from "../utils/auth";
import { publicProcedure } from "../utils/orpc";

export const userRouter = {
  getSession: publicProcedure.handler(async ({ context: { headers } }) => {
    return await auth.api.getSession({
      headers,
      query: { disableCookieCache: true },
    });
  }),
};
