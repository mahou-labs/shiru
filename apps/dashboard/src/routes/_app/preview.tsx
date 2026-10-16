import { Spinner } from "@shiru/ui/components/spinner";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Where the API sends a signed-out visitor of a preview. `_app` signs them in first, then this
 * sends them back to the API, which hands the preview host its access grant.
 */
export const Route = createFileRoute("/_app/preview")({
  validateSearch: z.object({ host: z.string(), path: z.string().optional() }),
  beforeLoad: ({ search, preload }) => {
    if (preload) return;
    const query = new URLSearchParams({ host: search.host, path: search.path ?? "/" });
    window.location.replace(
      `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/preview/authorize?${query.toString()}`,
    );
  },
  component: () => (
    <div className="flex flex-1 items-center justify-center">
      <Spinner />
    </div>
  ),
});
