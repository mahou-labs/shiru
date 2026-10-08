import { describe, expect, it } from "vite-plus/test";

import { polarCustomers, sentEmails } from "../test/bindings";
import { createClient, verificationLink } from "../test/client";

describe("sign-up and email verification", () => {
  it("requires a verified email before signing in", async () => {
    const client = createClient();
    const signUp = await client.post("/auth/sign-up/email", {
      email: "ada@example.com",
      password: "password123",
      name: "Ada",
      callbackURL: "http://localhost:3001/dashboard",
    });
    expect(signUp.status).toBe(200);
    expect(await signUp.json()).toMatchObject({ token: null, user: { emailVerified: false } });

    const signIn = await client.post("/auth/sign-in/email", {
      email: "ada@example.com",
      password: "password123",
    });
    expect(signIn.status).toBe(403);
    expect(await signIn.json()).toMatchObject({ code: "EMAIL_NOT_VERIFIED" });
  });

  it("emails a link that verifies the account and signs the user in", async () => {
    const client = createClient();
    await client.post("/auth/sign-up/email", {
      email: "grace@example.com",
      password: "password123",
      name: "Grace",
      callbackURL: "http://localhost:3001/dashboard",
    });
    expect(sentEmails.findLast((email) => email.to === "grace@example.com")).toMatchObject({
      from: "Shiru <no-reply@shiru.sh>",
      subject: "Verify your email address",
    });

    const verify = await client.request(verificationLink("grace@example.com"));
    expect(verify.status).toBe(302);
    expect(verify.headers.get("location")).toBe("http://localhost:3001/dashboard");

    const session = await (await client.request("/auth/get-session")).json();
    expect(session).toMatchObject({ user: { email: "grace@example.com", emailVerified: true } });
  });

  it("creates a Polar customer for each new user", async () => {
    await createClient().signUpVerified("linus@example.com", "Linus");
    expect(
      polarCustomers.filter((customer) => customer.email === "linus@example.com"),
    ).toHaveLength(1);
  });
});
