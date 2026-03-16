import * as z from "zod";
import { auth } from "../utils/auth";
import { authedProcedure, protectedProcedure } from "../utils/orpc";
import { ORPCError } from "@orpc/server";

export const orgInviteRouter = {
  list: protectedProcedure.handler(async ({ context: { headers, session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    return await auth.api.listInvitations({
      headers,
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        email: z.email(),
        role: z.enum(["admin", "member", "owner"]),
      }),
    )
    .handler(async ({ context: { headers, session }, input }) => {
      if (!session.activeOrganizationId) {
        throw new ORPCError("Organization not found");
      }

      return await auth.api.createInvitation({
        headers,
        body: {
          email: input.email,
          role: input.role,
          organizationId: session.activeOrganizationId,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context: { headers, session }, input }) => {
      if (!session.activeOrganizationId) {
        throw new ORPCError("Organization not found");
      }

      return await auth.api.cancelInvitation({
        headers,
        body: {
          invitationId: input.id,
        },
      });
    }),

  accept: authedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.acceptInvitation({
        headers,
        body: {
          invitationId: input.id,
        },
      });
    }),
};
