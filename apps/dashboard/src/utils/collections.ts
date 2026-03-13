/*
Example TanStack collection setup kept for reference.

import { QueryClient } from "@tanstack/query-core";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { orpc } from "./orpc-client";

const queryClient = new QueryClient();

const jobOptions = orpc.job.getAll.queryOptions();
export const jobsCollection = createCollection(
  queryCollectionOptions({
    queryKey: jobOptions.queryKey,
    queryFn: async (context) => jobOptions.queryFn(context),
    getKey: (job) => job.id,
    queryClient,
    onInsert: async ({ transaction }) => {
      const jobToInsert = transaction.mutations[0].modified;
      await orpc.job.create.call(jobToInsert);
    },
    onUpdate: async ({ transaction }) => {
      const { original, changes } = transaction.mutations[0];
      await orpc.job.update.call({ ...changes, id: original.id });
    },
    onDelete: async ({ transaction }) => {
      const jobToDelete = transaction.mutations[0].original;
      await orpc.job.delete.call({ id: jobToDelete.id });
    },
  }),
);

// Example Electric integration alternative:
// import { snakeCamelMapper } from "@electric-sql/client";
// import { electricCollectionOptions } from "@tanstack/electric-db-collection";
// const electricUrl = `${import.meta.env.VITE_API_URL}/electric/jobs`;
// const fetchClient = Object.assign(
//   (input: RequestInfo | URL, init?: RequestInit) => {
//     return fetch(input, { ...init, credentials: "include" });
//   },
//   { preconnect: fetch.preconnect },
// );
// export const jobsCollection = createCollection(
//   electricCollectionOptions({
//     id: "jobs",
//     schema: jobSelectSchema,
//     shapeOptions: {
//       url: electricUrl,
//       params: { table: "jobs" },
//       columnMapper: snakeCamelMapper(),
//       fetchClient,
//     },
//     getKey: (job) => job.id,
//   }),
// );
*/
