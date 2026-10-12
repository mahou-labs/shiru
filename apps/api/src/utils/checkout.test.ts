import { describe, expect, it } from "vite-plus/test";

import { polarCheckouts } from "../test/bindings";
import { createClient } from "../test/client";

describe("checkout", () => {
  it("opens a yearly checkout for the organization", async () => {
    const client = createClient();
    await client.signUpVerified("yearly@example.com");
    const organization = await client.createOrganization("Yearly Org");

    const response = await client.post("/auth/checkout", {
      slug: "yearly",
      reference_id: organization.id,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: "https://sandbox.polar.sh/checkout/1",
      redirect: true,
    });
    expect(polarCheckouts[0]).toMatchObject({
      products: ["prod_test_yearly"],
      metadata: { referenceId: organization.id },
      success_url: "http://localhost:3001/success?checkout_id={CHECKOUT_ID}",
    });
  });

  it("opens a monthly checkout for the organization", async () => {
    const client = createClient();
    await client.signUpVerified("monthly@example.com");
    const organization = await client.createOrganization("Monthly Org");

    const response = await client.post("/auth/checkout", {
      slug: "monthly",
      reference_id: organization.id,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: "https://sandbox.polar.sh/checkout/2",
      redirect: true,
    });
    expect(polarCheckouts[1]).toMatchObject({
      products: ["prod_test_monthly"],
      metadata: { referenceId: organization.id },
    });
  });

  it("rejects a slug that is not a product", async () => {
    const client = createClient();
    await client.signUpVerified("stale-slug@example.com");
    const organization = await client.createOrganization("Stale Slug Org");

    const response = await client.post("/auth/checkout", {
      slug: "starter-monthly",
      reference_id: organization.id,
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Product not found" });
    expect(polarCheckouts).toHaveLength(2);
  });
});
