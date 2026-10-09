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

function linkIn(email: string, pattern: RegExp) {
  const message = sentEmails.findLast((sent) => sent.to === email);
  const link = message?.text.match(pattern)?.[0];
  if (!link) throw new Error(`no matching link emailed to ${email}`);
  return link.replace(/[)\]]+$/, "");
}

describe("password reset", () => {
  it("emails a link that lets the user set a new password", async () => {
    const client = createClient();
    await client.signUpVerified("hedy@example.com", "Hedy");

    const request = await createClient().post("/auth/request-password-reset", {
      email: "hedy@example.com",
      redirectTo: "http://localhost:3001/auth/reset-password",
    });
    expect(request.status).toBe(200);
    expect(sentEmails.findLast((email) => email.to === "hedy@example.com")).toMatchObject({
      subject: "Reset your password",
    });

    const callback = await createClient().request(
      linkIn("hedy@example.com", /http:\/\/localhost:3000\/auth\/reset-password\/\S+/),
    );
    expect(callback.status).toBe(302);
    const redirect = new URL(callback.headers.get("location")!);
    expect(redirect.origin + redirect.pathname).toBe("http://localhost:3001/auth/reset-password");
    const token = redirect.searchParams.get("token");

    const reset = await createClient().post("/auth/reset-password", {
      newPassword: "new-password-456",
      token,
    });
    expect(reset.status).toBe(200);

    const oldPassword = await createClient().post("/auth/sign-in/email", {
      email: "hedy@example.com",
      password: "password123",
    });
    expect(oldPassword.status).toBe(401);
    const newPassword = await createClient().post("/auth/sign-in/email", {
      email: "hedy@example.com",
      password: "new-password-456",
    });
    expect(newPassword.status).toBe(200);
  });
});

describe("organization invitations", () => {
  it("emails a dashboard link the invitee can accept", async () => {
    const owner = createClient();
    await owner.signUpVerified("owner@example.com", "Olive Owner");
    const organization = await owner.createOrganization("Invite Co");

    const invite = await owner.post("/auth/organization/invite-member", {
      email: "guest@example.com",
      role: "member",
    });
    expect(invite.status).toBe(200);
    const { id } = (await invite.json()) as { id: string };
    expect(sentEmails.findLast((email) => email.to === "guest@example.com")).toMatchObject({
      subject: "Join Invite Co on Shiru",
    });
    expect(linkIn("guest@example.com", /http:\/\/localhost:3001\/invite\/\S+/)).toBe(
      `http://localhost:3001/invite/${id}`,
    );

    const guest = createClient();
    await guest.signUpVerified("guest@example.com", "Gus Guest");
    const accept = await guest.post("/auth/organization/accept-invitation", { invitationId: id });
    expect(accept.status).toBe(200);
    expect(await accept.json()).toMatchObject({
      member: { organizationId: organization.id, role: "member" },
    });
  });
});
