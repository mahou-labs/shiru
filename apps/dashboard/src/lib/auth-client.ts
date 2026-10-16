import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { polarClient } from "@polar-sh/better-auth/client";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  basePath: "/auth",
  fetchOptions: { throw: true },
  plugins: [organizationClient(), polarClient(), oauthProviderClient()],
});

export type Session = NonNullable<Awaited<ReturnType<typeof authClient.getSession>>>;
