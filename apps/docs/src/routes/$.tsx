import { createFileRoute, redirect } from "@tanstack/react-router";

import { getPublishedDocument } from "@/functions/document";

export const Route = createFileRoute("/$")({
  component: DocumentRoute,
  head: ({ loaderData }) => documentHead(loaderData),
  loader: ({ params }) => {
    const path = params._splat ?? "";
    if (path.endsWith("/")) {
      throw redirect({ href: `/${path.slice(0, -1)}` });
    }
    return getPublishedDocument({ data: { path } });
  },
  notFoundComponent: NotFound,
});

function DocumentRoute() {
  const { Document } = Route.useLoaderData() ?? { Document: null };
  return <>{Document}</>;
}

function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p>Not found</p>
    </main>
  );
}

function documentHead(loaderData: { description?: string; title: string } | undefined) {
  if (!loaderData) {
    return {};
  }

  return {
    meta: [
      { title: loaderData.title },
      ...(loaderData.description ? [{ content: loaderData.description, name: "description" }] : []),
    ],
  };
}
