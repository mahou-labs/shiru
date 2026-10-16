import { bindings, defineConfig, defineContainer, exports, triggers } from "cf/config";

const builder = defineContainer({
  name: "shiru-api-builder",
  schedulingPolicy: "durable-object",
  images: { builder: { dockerfile: "../builder/Dockerfile", buildContext: "../builder" } },
});

export default defineConfig(({ mode }) => {
  const development = mode === "development";

  return {
    worker: {
      name: "shiru-api",
      entrypoint: "./src/index.ts",
      compatibilityDate: "2026-10-07",
      compatibilityFlags: ["nodejs_compat"],
      domains: ["api.shiru.sh"],
      observability: {
        enabled: true,
        traces: {
          enabled: true,
          headSamplingRate: 0.1,
        },
      },
      env: {
        DB: bindings.d1({ name: "shiru-api", id: "094e93eb-7015-487f-8888-7d5013a4a8e5" }),
        DASHBOARD_URL: bindings.text(
          development ? "http://localhost:3001" : "https://app.shiru.sh",
        ),
        SITE_URL: bindings.text(development ? "http://localhost:3002" : "https://shiru.sh"),
        // Docs live at <slug>.DOCS_DOMAIN, a domain apart from shiru.sh so docs content never
        // shares a site with the dashboard and API.
        DOCS_DOMAIN: bindings.text(development ? "docs.localhost" : "shiru.page"),
        BETTER_AUTH_SECRET: bindings.secret(),
        BETTER_AUTH_URL: bindings.text(
          development ? "http://localhost:3000" : "https://api.shiru.sh",
        ),
        POLAR_ACCESS_TOKEN: bindings.secret(),
        POLAR_WEBHOOK_SECRET: bindings.secret(),
        POLAR_MONTHLY_PRODUCT_ID: bindings.text(
          development
            ? "886797b2-ee38-459c-9904-9d76ba5c50af"
            : "57d8f9c8-0eb7-40e3-9a24-7d3927b1af71",
        ),
        POLAR_YEARLY_PRODUCT_ID: bindings.text(
          development
            ? "b8a0905d-e14c-4e9d-afaa-7af02bdc940a"
            : "dceaf15a-dad4-4809-a4cc-ce048ff90a87",
        ),
        ENVIRONMENT: bindings.text(development ? "development" : "production"),
        // Builds deploy to this Workers for Platforms namespace, which apps/dispatch serves.
        // Development never deploys, so neither secret is needed there.
        DISPATCH_ACCOUNT_ID: bindings.secret(),
        DISPATCH_API_TOKEN: bindings.secret(),
        DISPATCH_NAMESPACE: bindings.text("shiru-docs"),
        // Custom domains are Cloudflare for SaaS custom hostnames on the shiru.page zone. DOMAINS
        // maps them to docs for apps/dispatch, which binds the same namespace. Development never
        // calls Cloudflare, so the token is not needed there.
        DOMAINS: bindings.kv({ id: "69af27bf639d4f3f8c07d6796320354e" }),
        CUSTOM_HOSTNAMES_ZONE_ID: bindings.text("3ff277f811a387071e76995af5ab106d"),
        CUSTOM_HOSTNAMES_API_TOKEN: bindings.secret(),
        // What a custom domain's CNAME points at.
        CUSTOM_DOMAIN_TARGET: bindings.text(
          development ? "cname.docs.localhost" : "cname.shiru.page",
        ),
        EMAIL: bindings.sendEmail({ dev: { remote: false } }),
        // Per-IP limits enforced in src/utils/rate-limit.ts. Namespace ids are unique per account.
        API_RATE_LIMITER: bindings.rateLimit({
          namespace: "1001",
          simple: { limit: 300, period: 60 },
        }),
        PUBLIC_WRITE_RATE_LIMITER: bindings.rateLimit({
          namespace: "1002",
          simple: { limit: 10, period: 60 },
        }),
        // No PostHog project yet. Switch to bindings.secret() in production once a key exists.
        POSTHOG_KEY: bindings.text(""),
        POSTHOG_HOST: bindings.text("https://us.i.posthog.com"),
        DOCS: bindings.durableObject({ worker: "shiru-api", exportName: "Doc" }),
        PUBLISH_WORKFLOW: bindings.workflow({
          name: "shiru-publish",
          worker: "shiru-api",
          exportName: "PublishWorkflow",
        }),
        // One repo per managed doc. Artifacts has no local simulation, so development uses a
        // real staging namespace; the production namespace is created at first deploy.
        ARTIFACTS: bindings.artifacts({
          namespace: development ? "shiru-staging" : "shiru-docs",
          dev: { remote: true },
        }),
      },
      // Syncs custom domain status with Cloudflare.
      triggers: [triggers.scheduled({ schedule: "*/10 * * * *" })],
      exports: {
        // The previous app on this Worker ran a Durable Object; retiring it lets this code deploy.
        BuilderSandbox: exports.durableObject({ state: "deleted" }),
        Builder: exports.durableObject({ storage: "sqlite", container: builder }),
        Doc: exports.durableObject({ storage: "sqlite" }),
        PublishWorkflow: exports.workflow({ name: "shiru-publish" }),
      },
    },
    containers: [builder],
  };
});
