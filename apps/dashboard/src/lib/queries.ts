import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

import { authClient } from "./auth-client";

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: () => authClient.getSession(),
  staleTime: Infinity,
});

export const organizationsQuery = queryOptions({
  queryKey: ["organizations"],
  queryFn: () => authClient.organization.list(),
});

export const activeOrganizationQuery = queryOptions({
  queryKey: ["organizations", "active"],
  queryFn: () => authClient.organization.getFullOrganization(),
});

export const accessQuery = orpc.subscription.queryOptions();

export function invitationQuery(id: string) {
  return queryOptions({
    queryKey: ["invitation", id],
    queryFn: () => authClient.organization.getInvitation({ query: { id } }),
    retry: false,
    meta: { silent: true },
  });
}

export function useSession() {
  const { data } = useSuspenseQuery(sessionQuery);
  if (!data) throw new Error("useSession is only available behind the signed-in layout");
  return data;
}
