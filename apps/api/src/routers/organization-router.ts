import * as z from "zod";
import { auth } from "../utils/auth";
import { authedProcedure, protectedProcedure, resolveActiveOrganization } from "../utils/orpc";
import { log } from "@/utils/logger";
import { ORPCError } from "@orpc/server";
import { tryCatch } from "@/utils/try-catch";
import { getCloudflareClient, getZoneId } from "@/utils/cloudflare";
import { organizations } from "@/schema/auth";
import { customDomains } from "@/schema/custom-domain";
import { subscriptions } from "@/schema/subscription";
import { eq } from "drizzle-orm";
import { db } from "@/utils/db";

const HOSTNAME_REGEX = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const organizationRouter = {
  createOrg: authedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        logo: z.string().url().optional(),
        hostingMode: z.enum(["managed", "github"]).optional().default("managed"),
        hostname: z.string().optional(),
      }),
    )
    .handler(async ({ context: { headers, resHeaders }, input }) => {
      const data = await auth.api.createOrganization({
        headers,
        body: { name: input.name, slug: input.slug },
      });

      const { headers: sessionHeaders } = await auth.api.setActiveOrganization({
        headers,
        returnHeaders: true,
        body: {
          organizationId: data?.id,
        },
      });

      const cookies = sessionHeaders.getSetCookie();
      for (const cookie of cookies) {
        resHeaders?.append("set-cookie", cookie);
      }

      if (data?.id && (input.logo || input.hostingMode !== "managed")) {
        const updateData: Record<string, string> = {};
        if (input.logo) updateData.logo = input.logo;

        if (Object.keys(updateData).length > 0) {
          await tryCatch(
            auth.api.updateOrganization({
              headers,
              body: { data: updateData },
            }),
          );
        }

        if (input.hostingMode) {
          await tryCatch(
            db
              .update(organizations)
              .set({ hostingMode: input.hostingMode })
              .where(eq(organizations.id, data.id)),
          );
        }
      }

      const hostnameValue = input.hostname;
      if (data?.id && hostnameValue && HOSTNAME_REGEX.test(hostnameValue)) {
        const orgId = data.id;
        const cf = getCloudflareClient();
        const zoneId = getZoneId();

        const { data: cfResult, error: cfError } = await tryCatch(
          cf.customHostnames.create({
            zone_id: zoneId,
            hostname: hostnameValue,
            ssl: { method: "txt", type: "dv" },
          }),
        );

        if (cfError || !cfResult) {
          log.error("org.createOrg_domain_cf_failed", cfError ?? new Error("No result"), {
            hostname: hostnameValue,
            organizationId: orgId,
          });
        } else {
          const sslValidation = cfResult.ssl?.validation_records?.[0];

          const { error: dbError } = await tryCatch(
            db.insert(customDomains).values({
              organizationId: orgId,
              hostname: hostnameValue,
              cloudflareHostnameId: cfResult.id,
              status: "pending_verification",
              verificationTxtName: cfResult.ownership_verification?.name ?? null,
              verificationTxtValue: cfResult.ownership_verification?.value ?? null,
              sslStatus: "pending",
              sslValidationTxtName: sslValidation?.txt_name ?? null,
              sslValidationTxtValue: sslValidation?.txt_value ?? null,
            }),
          );

          if (dbError) {
            log.error("org.createOrg_domain_db_failed", dbError, {
              hostname: hostnameValue,
              organizationId: orgId,
            });
            await tryCatch(cf.customHostnames.delete(cfResult.id, { zone_id: zoneId }));
          }
        }
      }

      return data;
    }),

  checkSlugAvailability: authedProcedure
    .input(z.string().min(1))
    .output(z.boolean())
    .handler(async ({ input }) => {
      try {
        const { status } = await auth.api.checkOrganizationSlug({
          body: {
            slug: input,
          },
        });

        return status;
      } catch (e) {
        log.error("org.check_slug_failed", e, { slug: input });
        return false;
      }
    }),

  getFullOrg: protectedProcedure.handler(async ({ context: { headers } }) => {
    const org = await auth.api.getFullOrganization({ headers });
    return org;
  }),

  getOrgList: protectedProcedure.handler(async ({ context: { headers } }) => {
    return await auth.api.listOrganizations({ headers });
  }),

  getMembers: protectedProcedure.handler(async ({ context: { headers } }) => {
    return await auth.api.listMembers({ headers });
  }),

  setActive: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .handler(async ({ context: { headers, resHeaders }, input }) => {
      const { headers: sessionHeaders } = await auth.api.setActiveOrganization({
        headers,
        returnHeaders: true,
        body: {
          organizationId: input.organizationId,
        },
      });

      const cookies = sessionHeaders.getSetCookie();
      for (const cookie of cookies) {
        resHeaders?.append("set-cookie", cookie);
      }
    }),

  getSubscription: protectedProcedure.handler(async ({ context: { session } }) => {
    if (!session?.activeOrganizationId) {
      return null;
    }

    const { data: subscription, error } = await tryCatch(
      db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.organizationId, session.activeOrganizationId)),
    );

    if (error) {
      log.error("org.get_subscription_failed", error, {
        organizationId: session.activeOrganizationId,
      });
      throw new ORPCError("Failed to fetch subscription");
    }

    return subscription[0] ?? null;
  }),

  updateOrg: protectedProcedure
    .input(
      z
        .object({
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
        })
        .refine((data) => data.name || data.slug, {
          message: "At least one of name or slug is required",
        }),
    )
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.updateOrganization({
        headers,
        body: {
          data: input,
        },
      });
    }),

  updateOrgLogo: protectedProcedure
    .input(z.object({ logo: z.union([z.url(), z.literal("")]) }))
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.updateOrganization({
        headers,
        body: {
          data: { logo: input.logo },
        },
      });
    }),

  deleteOrg: protectedProcedure.handler(async ({ context: { headers, resHeaders, session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    await auth.api.deleteOrganization({
      headers,
      body: {
        organizationId: session.activeOrganizationId,
      },
    });

    const nextOrgId = await resolveActiveOrganization(headers, resHeaders);

    return { hasRemainingOrgs: !!nextOrgId };
  }),

  removeMember: protectedProcedure
    .input(z.object({ memberIdOrEmail: z.string() }))
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.removeMember({
        headers,
        body: {
          memberIdOrEmail: input.memberIdOrEmail,
        },
      });
    }),

  updateMemberRole: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
        role: z.enum(["admin", "member"]),
      }),
    )
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.updateMemberRole({
        headers,
        body: {
          memberId: input.memberId,
          role: input.role,
        },
      });
    }),

  leaveOrg: protectedProcedure.handler(async ({ context: { headers, session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    return await auth.api.leaveOrganization({
      headers,
      body: {
        organizationId: session.activeOrganizationId,
      },
    });
  }),

  listInvites: protectedProcedure.handler(async ({ context: { headers, session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    return await auth.api.listInvitations({ headers });
  }),

  createInvite: protectedProcedure
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

  deleteInvite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context: { headers, session }, input }) => {
      if (!session.activeOrganizationId) {
        throw new ORPCError("Organization not found");
      }

      return await auth.api.cancelInvitation({
        headers,
        body: { invitationId: input.id },
      });
    }),

  acceptInvite: authedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.acceptInvitation({
        headers,
        body: { invitationId: input.id },
      });
    }),
};
