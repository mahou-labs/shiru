import { Polar } from "@polar-sh/sdk";
import { env } from "cloudflare:workers";

export const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.ENVIRONMENT === "production" ? "production" : "sandbox",
});
