import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";

type SuccessSearch = {
  checkout_id?: string;
};

export const Route = createFileRoute("/success")({
  component: SuccessComponent,
  validateSearch: (search: Record<string, unknown>): SuccessSearch => {
    return {
      checkout_id: typeof search.checkout_id === "string" ? search.checkout_id : undefined,
    };
  },
});

function SuccessComponent() {
  const { checkout_id } = Route.useSearch();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void navigate({ to: "/" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success/10">
            <svg
              className="size-8 text-success-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Success checkmark</title>
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Purchase Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Your order has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {checkout_id ? (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-muted-foreground text-sm">Order ID</p>
              <p className="font-mono text-sm">{checkout_id}</p>
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-center text-muted-foreground text-sm">
              Redirecting to dashboard in {countdown} seconds...
            </p>

            <div className="flex flex-col gap-2">
              <Button className="w-full" render={<Link to="/" />}>
                Go to Dashboard
              </Button>
              <Button className="w-full" render={<Link to="/" />} variant="outline">
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
