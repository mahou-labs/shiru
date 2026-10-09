import { Button } from "@shiru/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shiru/ui/components/empty";
import { Link, createFileRoute } from "@tanstack/react-router";
import { IconCheckOutlineDuo18 } from "nucleo-ui-outline-duo-18";

import { accessQuery } from "@/lib/queries";

export const Route = createFileRoute("/success")({
  beforeLoad: ({ context }) => context.queryClient.invalidateQueries(accessQuery),
  component: CheckoutSuccess,
});

function CheckoutSuccess() {
  return (
    <Empty className="min-h-svh bg-sidebar">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconCheckOutlineDuo18 />
        </EmptyMedia>
        <EmptyTitle>You're subscribed</EmptyTitle>
        <EmptyDescription>
          Thanks for upgrading. It can take a moment for your plan to show up in billing.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link to="/" />}>Go to dashboard</Button>
      </EmptyContent>
    </Empty>
  );
}
