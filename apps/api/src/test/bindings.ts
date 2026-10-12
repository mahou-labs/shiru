import { DatabaseSync } from "node:sqlite";

import { generateDrizzleJson, generateMigration } from "drizzle-kit/payload/sqlite";
import { drizzle } from "drizzle-orm/node-sqlite";

import * as schema from "../schema";

type SentEmail = { from: string; to: string; subject: string; html: string; text: string };
type PolarCustomer = { id: string; email: string; name: string | null; externalId: string | null };

export const sentEmails: SentEmail[] = [];
export const polarCustomers: PolarCustomer[] = [];
export const polarCheckouts: Record<string, unknown>[] = [];
const pendingWork: Promise<unknown>[] = [];

const client = new DatabaseSync(":memory:");
const statements = await generateMigration(
  await generateDrizzleJson({}),
  await generateDrizzleJson(schema),
);
for (const statement of statements) client.exec(statement);

export const db = drizzle({ client });

export const env = {
  DB: undefined,
  DASHBOARD_URL: "http://localhost:3001",
  SITE_URL: "http://localhost:3002",
  BETTER_AUTH_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters",
  POLAR_ACCESS_TOKEN: "polar_test_token",
  POLAR_WEBHOOK_SECRET: "polar_test_webhook_secret",
  POLAR_MONTHLY_PRODUCT_ID: "prod_test_monthly",
  POLAR_YEARLY_PRODUCT_ID: "prod_test_yearly",
  ENVIRONMENT: "development",
  POSTHOG_KEY: "",
  POSTHOG_HOST: "https://us.i.posthog.com",
  EMAIL: {
    send: async (message: SentEmail) => {
      sentEmails.push(message);
      return { messageId: `test-${sentEmails.length}` };
    },
  },
};

export function waitUntil(promise: Promise<unknown>) {
  pendingWork.push(promise);
}

export async function flushWaitUntil() {
  while (pendingWork.length > 0) await Promise.all(pendingWork.splice(0));
}

export class Polar {
  customers = {
    list: async ({ email }: { email: string }) => ({
      result: { items: polarCustomers.filter((customer) => customer.email === email) },
    }),
    create: async (input: { email: string; name?: string; externalId?: string }) => {
      const customer = {
        id: `cus_${polarCustomers.length + 1}`,
        email: input.email,
        name: input.name ?? null,
        externalId: input.externalId ?? null,
      };
      polarCustomers.push(customer);
      return customer;
    },
    update: async ({
      id,
      customerUpdate,
    }: {
      id: string;
      customerUpdate: { externalId?: string };
    }) => {
      const customer = polarCustomers.find((candidate) => candidate.id === id)!;
      Object.assign(customer, customerUpdate);
      return customer;
    },
    delete: async ({ id }: { id: string }) => {
      polarCustomers.splice(
        polarCustomers.findIndex((customer) => customer.id === id),
        1,
      );
    },
  };
  checkouts = {
    create: async (input: Record<string, unknown>) => {
      polarCheckouts.push(input);
      return { url: `https://sandbox.polar.sh/checkout/${polarCheckouts.length}` };
    },
  };
}
