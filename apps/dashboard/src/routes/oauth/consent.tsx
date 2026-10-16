import { Button } from "@shiru/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@shiru/ui/components/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { sessionQuery } from "@/lib/queries";

// The API signs every parameter of this page's query, and consenting sends the query back as it
// is, so the schema keeps the keys it does not read.
const consentSearch = z.looseObject({
  client_id: z.string().catch(""),
  scope: z.string().catch(""),
});

const scopeLabels: Record<string, string> = {
  "docs:read": "See your docs sites, their files, drafts and publish status",
  "docs:write": "Edit drafts and publish your docs sites",
  offline_access: "Stay connected without asking you again",
};

export const Route = createFileRoute("/oauth/consent")({
  validateSearch: consentSearch,
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.fetchQuery(sessionQuery);
    if (!session) throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } });
    return { session };
  },
  component: Consent,
});

function Consent() {
  const { client_id, scope } = Route.useSearch();
  const { session } = Route.useRouteContext();
  const client = useQuery({
    queryKey: ["oauth-client", client_id],
    queryFn: () => authClient.oauth2.publicClient({ query: { client_id } }),
    retry: false,
  });
  // The auth client follows the redirect back to the agent, so the page stays pending until then.
  const decide = useMutation({
    mutationFn: (accept: boolean) => authClient.oauth2.consent({ accept }),
  });
  const name = client.data?.client_name ?? "An application";
  const scopes = scope.split(" ").filter((value) => value in scopeLabels);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-sidebar p-4">
      <p className="font-heading font-semibold text-lg">Shiru</p>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Allow {name} to use your account?</CardTitle>
          <CardDescription>
            It will act as <strong className="text-foreground">{session.user.email}</strong> in
            every organization you belong to.
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
            {scopes.map((value) => (
              <li key={value}>{scopeLabels[value]}</li>
            ))}
          </ul>
        </CardPanel>
        <CardFooter className="justify-end gap-2">
          <Button
            variant="outline"
            disabled={decide.isPending}
            loading={decide.isPending && decide.variables === false}
            onClick={() => decide.mutate(false)}
          >
            Deny
          </Button>
          <Button
            disabled={decide.isPending || client.isPending}
            loading={decide.isPending && decide.variables === true}
            onClick={() => decide.mutate(true)}
          >
            Allow
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
