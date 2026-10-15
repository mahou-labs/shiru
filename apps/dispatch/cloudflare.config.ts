import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig(({ mode }) => {
  const development = mode === "development";
  // Same docs domain as apps/api.
  const docsDomain = development ? "docs.localhost" : "shiru.page";
  const domains = {
    DOCS_DOMAIN: bindings.text(docsDomain),
    PREVIEW_DOMAIN: bindings.text(`preview.${docsDomain}`),
  };

  return {
    worker: {
      name: "shiru-dispatch",
      entrypoint: "./src/index.ts",
      compatibilityDate: "2026-10-07",
      observability: { enabled: true },
      // Every doc's hostname. Preview hostnames match too, and route() answers them 404.
      triggers: development
        ? []
        : [triggers.fetch({ pattern: "*.shiru.page/*", zone: "shiru.page" })],
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
