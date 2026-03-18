import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import * as z from "zod";
import { customDomains } from "@/schema/custom-domain";
import { db } from "@/utils/db";
import { log } from "@/utils/logger";
import { tryCatch } from "@/utils/try-catch";
import { protectedProcedure } from "../utils/orpc";

const HOSTNAME_REGEX = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

type CloudflareCustomHostnameResponse = {
  success: boolean;
  result?: {
    id: string;
    hostname: string;
    status: string;
    ssl: {
      status: string;
      validation_records?: Array<{
        txt_name?: string;
        txt_value?: string;
        status?: string;
      }>;
    };
    ownership_verification?: {
      type: string;
      name: string;
      value: string;
    };
    verification_errors?: string[];
  };
  errors?: Array<{ code: number; message: string }>;
};

async function cloudflareRequest<T = CloudflareCustomHostnameResponse>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${env.CLOUDFLARE_API_TOKEN}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers,
  });

  return response.json();
}

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

      // Check if a domain already exists for this org
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

      // Create custom hostname via Cloudflare API
      const cfResponse = await cloudflareRequest(
        `/zones/${env.CLOUDFLARE_ZONE_ID}/custom_hostnames`,
        {
          method: "POST",
          body: JSON.stringify({
            hostname: input.hostname,
            ssl: {
              method: "txt",
              type: "dv",
            },
          }),
        },
      );

      if (!cfResponse.success || !cfResponse.result) {
        const errorMsg = cfResponse.errors?.map((e) => e.message).join(", ") ?? "Unknown error";
        log.error("domain.createDomain_cloudflare_failed", new Error(errorMsg), {
          hostname: input.hostname,
          organizationId: orgId,
        });
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: `Failed to register domain with Cloudflare: ${errorMsg}`,
        });
      }

      const cfResult = cfResponse.result;
      const sslValidation = cfResult.ssl.validation_records?.[0];

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
        // Best-effort cleanup: delete the CF hostname we just created
        await tryCatch(
          cloudflareRequest(`/zones/${env.CLOUDFLARE_ZONE_ID}/custom_hostnames/${cfResult.id}`, {
            method: "DELETE",
          }),
        );
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

    // Poll Cloudflare for current status
    const cfResponse = await cloudflareRequest(
      `/zones/${env.CLOUDFLARE_ZONE_ID}/custom_hostnames/${domain.cloudflareHostnameId}`,
    );

    if (!cfResponse.success || !cfResponse.result) {
      log.error(
        "domain.checkDomainStatus_cloudflare_failed",
        new Error(cfResponse.errors?.map((e) => e.message).join(", ") ?? "Unknown error"),
        { hostname: domain.hostname, organizationId: orgId },
      );
      return domain;
    }

    const cfResult = cfResponse.result;
    const sslValidation = cfResult.ssl.validation_records?.[0];

    // Map Cloudflare status to our status
    let status = domain.status;
    if (cfResult.status === "active") {
      status = "active";
    } else if (cfResult.verification_errors && cfResult.verification_errors.length > 0) {
      status = "error";
    } else {
      status = "pending_verification";
    }

    let sslStatus = domain.sslStatus;
    if (cfResult.ssl.status === "active") {
      sslStatus = "active";
    } else if (
      cfResult.ssl.status === "validation_timed_out" ||
      cfResult.ssl.status === "deleted"
    ) {
      sslStatus = "error";
    } else {
      sslStatus = "pending";
    }

    const errorMessage =
      cfResult.verification_errors && cfResult.verification_errors.length > 0
        ? cfResult.verification_errors.join(", ")
        : null;

    // Update DB with latest status
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

    // Delete from Cloudflare
    if (domain.cloudflareHostnameId) {
      const { error: cfError } = await tryCatch(
        cloudflareRequest(
          `/zones/${env.CLOUDFLARE_ZONE_ID}/custom_hostnames/${domain.cloudflareHostnameId}`,
          { method: "DELETE" },
        ),
      );

      if (cfError) {
        log.error("domain.deleteDomain_cloudflare_failed", cfError, {
          hostname: domain.hostname,
          organizationId: orgId,
        });
        // Continue with DB deletion even if CF fails
      }
    }

    // Delete from DB
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
