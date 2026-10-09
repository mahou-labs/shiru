import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "shiru-dashboard",
    compatibilityDate: "2026-10-07",
    domains: ["app.shiru.sh"],
    assets: {
      notFoundHandling: "single-page-application",
    },
  },
});
