import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "shiru-dashboard",
    compatibilityDate: "2026-10-07",
    assets: {
      notFoundHandling: "single-page-application",
    },
  },
});
