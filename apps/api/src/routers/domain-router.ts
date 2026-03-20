import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { customDomains } from "@/schema/custom-domain";
import { getCloudflareClient, getZoneId } from "@/utils/cloudflare";
import { db } from "@/utils/db";
import { log } from "@/utils/logger";
import { tryCatch } from "@/utils/try-catch";
import { protectedProcedure } from "../utils/orpc";

const HOSTNAME_REGEX = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const domainRouter = {
  getDomain: protectedProcedure.handler(async ({ context: { session } }) => {
    const orgId = session.activeOrganizationId;
    if (!orgId) {
      throw new ORPCError("BAD_REQUEST", { message: "No active organization" });
    }

    const { data, error } = await tryCatch(
      db
        .select()
        .from(customDomains)
        .where(eq(customDomains.organizationId, orgId))
        .then((rows) => rows[0]),
    );

    if (error) {
      log.error("domain.getDomain_failed", error, { organizationId: orgId });
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch domain" });
    }

    return data ?? null;
  }),

  createDomain: protectedProcedure
    .input(
      z.object({
        hostname: z
          .string()
          .min(1, "Hostname is required")
          .regex(HOSTNAME_REGEX, "Invalid hostname format"),
      }),
    )
    .handler(async ({ context: { session }, input }) => {
      const orgId = session.activeOrganizationId;
      if (!orgId) {
        throw new ORPCError("BAD_REQUEST", { message: "No active organization" });
      }

      const { data: existing } = await tryCatch(
        db
          .select({ id: customDomains.id })
          .from(customDomains)
          .where(eq(customDomains.organizationId, orgId))
          .then((rows) => rows[0]),
      );

      if (existing) {
        throw new ORPCError("BAD_REQUEST", {
          message: "A custom domain is already configured. Remove it first to add a new one.",
        });
      }

      const cf = getCloudflareClient();
      const zoneId = getZoneId();

      const { data: cfResult, error: cfError } = await tryCatch(
        cf.customHostnames.create({
          zone_id: zoneId,
          hostname: input.hostname,
          ssl: { method: "txt", type: "dv" },
        }),
      );

      if (cfError || !cfResult) {
        const errorMsg = cfError instanceof Error ? cfError.message : "Unknown error";
        log.error("domain.createDomain_cloudflare_failed", cfError ?? new Error(errorMsg), {
          hostname: input.hostname,
          organizationId: orgId,
        });
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: `Failed to register domain with Cloudflare: ${errorMsg}`,
        });
      }

      const sslValidation = cfResult.ssl?.validation_records?.[0];

      const { data: domain, error } = await tryCatch(
        db
          .insert(customDomains)
          .values({
            organizationId: orgId,
            hostname: input.hostname,
            cloudflareHostnameId: cfResult.id,
            status: "pending_verification",
            verificationTxtName: cfResult.ownership_verification?.name ?? null,
            verificationTxtValue: cfResult.ownership_verification?.value ?? null,
            sslStatus: "pending",
            sslValidationTxtName: sslValidation?.txt_name ?? null,
            sslValidationTxtValue: sslValidation?.txt_value ?? null,
          })
          .returning()
          .then((rows) => rows[0]),
      );

      if (error) {
        log.error("domain.createDomain_db_failed", error, {
          hostname: input.hostname,
          organizationId: orgId,
        });
        await tryCatch(cf.customHostnames.delete(cfResult.id, { zone_id: zoneId }));
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to save domain" });
      }

      return domain;
    }),

  checkDomainStatus: protectedProcedure.handler(async ({ context: { session } }) => {
    const orgId = session.activeOrganizationId;
    if (!orgId) {
      throw new ORPCError("BAD_REQUEST", { message: "No active organization" });
    }

    const { data: domain, error: fetchError } = await tryCatch(
      db
        .select()
        .from(customDomains)
        .where(eq(customDomains.organizationId, orgId))
        .then((rows) => rows[0]),
    );

    if (fetchError || !domain) {
      throw new ORPCError("NOT_FOUND", { message: "No custom domain configured" });
    }

    if (!domain.cloudflareHostnameId) {
      return domain;
    }

    const cf = getCloudflareClient();
    const zoneId = getZoneId();

    const { data: cfResult, error: cfError } = await tryCatch(
      cf.customHostnames.get(domain.cloudflareHostnameId, { zone_id: zoneId }),
    );

    if (cfError || !cfResult) {
      log.error(
        "domain.checkDomainStatus_cloudflare_failed",
        cfError ?? new Error("Unknown error"),
        { hostname: domain.hostname, organizationId: orgId },
      );
      return domain;
    }

    const sslValidation = cfResult.ssl?.validation_records?.[0];

    let status = domain.status;
    if (cfResult.status === "active") {
      status = "active";
    } else if (cfResult.verification_errors && cfResult.verification_errors.length > 0) {
      status = "error";
    } else {
      status = "pending_verification";
    }

    let sslStatus = domain.sslStatus;
    const cfSslStatus = cfResult.ssl?.status;
    if (cfSslStatus === "active") {
      sslStatus = "active";
    } else if (cfSslStatus === "validation_timed_out" || cfSslStatus === "deleted") {
      sslStatus = "error";
    } else {
      sslStatus = "pending";
    }

    const errorMessage =
      cfResult.verification_errors && cfResult.verification_errors.length > 0
        ? cfResult.verification_errors.join(", ")
        : null;

    const { data: updated, error: updateError } = await tryCatch(
      db
        .update(customDomains)
        .set({
          status,
          sslStatus,
          errorMessage,
          sslValidationTxtName: sslValidation?.txt_name ?? domain.sslValidationTxtName,
          sslValidationTxtValue: sslValidation?.txt_value ?? domain.sslValidationTxtValue,
        })
        .where(eq(customDomains.id, domain.id))
        .returning()
        .then((rows) => rows[0]),
    );

    if (updateError) {
      log.error("domain.checkDomainStatus_update_failed", updateError, {
        hostname: domain.hostname,
        organizationId: orgId,
      });
      return domain;
    }

    return updated;
  }),

  deleteDomain: protectedProcedure.handler(async ({ context: { session } }) => {
    const orgId = session.activeOrganizationId;
    if (!orgId) {
      throw new ORPCError("BAD_REQUEST", { message: "No active organization" });
    }

    const { data: domain, error: fetchError } = await tryCatch(
      db
        .select()
        .from(customDomains)
        .where(eq(customDomains.organizationId, orgId))
        .then((rows) => rows[0]),
    );

    if (fetchError || !domain) {
      throw new ORPCError("NOT_FOUND", { message: "No custom domain configured" });
    }

    if (domain.cloudflareHostnameId) {
      const cf = getCloudflareClient();
      const zoneId = getZoneId();

      const { error: cfError } = await tryCatch(
        cf.customHostnames.delete(domain.cloudflareHostnameId, { zone_id: zoneId }),
      );

      if (cfError) {
        log.error("domain.deleteDomain_cloudflare_failed", cfError, {
          hostname: domain.hostname,
          organizationId: orgId,
        });
      }
    }

    const { error: deleteError } = await tryCatch(
      db.delete(customDomains).where(eq(customDomains.id, domain.id)),
    );

    if (deleteError) {
      log.error("domain.deleteDomain_db_failed", deleteError, {
        hostname: domain.hostname,
        organizationId: orgId,
      });
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to remove domain" });
    }

    return { success: true };
  }),
};
