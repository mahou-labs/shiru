import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig(({ mode }) => {
  const development = mode === "development";
  // Same docs domain as apps/api.
  const docsDomain = development ? "docs.localhost" : "shiru.page";
  const domains = {
    DOCS_DOMAIN: bindings.text(docsDomain),
    PREVIEW_DOMAIN: bindings.text(`preview.${docsDomain}`),
    // Custom hostnames and doc redirects, written by apps/api. Development has its own local
    // namespace, so custom domains do not route there.
    DOMAINS: bindings.kv({ id: "69af27bf639d4f3f8c07d6796320354e" }),
  };

  return {
    worker: {
      name: "shiru-dispatch",
      entrypoint: "./src/index.ts",
      compatibilityDate: "2026-10-07",
      observability: { enabled: true },
      // Every hostname on the zone: docs, previews (route() answers them 404) and custom
      // hostnames, which as Cloudflare for SaaS custom hostnames only reach a Worker through `*/*`.
      triggers: development ? [] : [triggers.fetch({ pattern: "*/*", zone: "shiru.page" })],
      env: development
        ? {
            ...domains,
            // Overridable so a verify script can point it at its own API server.
            DEV_DOCS_ORIGIN: bindings.text(process.env.DEV_DOCS_ORIGIN ?? "http://localhost:3000"),
          }
        : { ...domains, DISPATCHER: bindings.dispatchNamespace({ namespace: "shiru-docs" }) },
    },
  };
});
