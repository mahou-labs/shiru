import { bindings, defineConfig } from "cf/config";

export default defineConfig(({ mode }) => {
  const development = mode === "development";
  // Same placeholder as apps/api until the docs domain is bought.
  const docsDomain = development ? "docs.localhost" : "shiru-docs.invalid";
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
      env: development
        ? {
            ...domains,
            // Overridable so a verify script can point it at its own API server.
            DEV_DOCS_ORIGIN: bindings.text(process.env.DEV_DOCS_ORIGIN ?? "http://localhost:3000"),
          }
        : { ...domains, DISPATCHER: bindings.dispatchNamespace({ namespace: "production" }) },
    },
  };
});
