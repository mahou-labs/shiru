import { createFileRoute } from "@tanstack/react-router";

import { getPublishedDocument } from "@/functions/document";
import { getDocumentHead } from "@/lib/document-head";

export const Route = createFileRoute("/")({
  component: DocumentRoute,
  head: ({ loaderData }) => getDocumentHead(loaderData),
  loader: () => getPublishedDocument({ data: { path: "" } }),
  notFoundComponent: NotFound,
});

function DocumentRoute() {
  const { Document } = Route.useLoaderData();
  return <>{Document}</>;
}

function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p>Not found</p>
    </main>
  );
}
