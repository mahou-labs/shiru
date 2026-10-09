import { render } from "@react-email/components";
import { env } from "cloudflare:workers";
import type { ComponentProps } from "react";

import ActionEmail from "../emails/action-email";

async function send(to: string, subject: string, props: ComponentProps<typeof ActionEmail>) {
  const email = <ActionEmail {...props} />;
  await env.EMAIL.send({
    from: "Shiru <no-reply@shiru.sh>",
    to,
    subject,
    html: await render(email),
    text: await render(email, { plainText: true }),
  });
}

export function sendVerificationEmail({
  to,
  name,
  link,
}: {
  to: string;
  name: string;
  link: string;
}) {
  return send(to, "Verify your email address", {
    preview: "Confirm your email to finish setting up Shiru",
    heading: "Verify your email",
    body: `Hi ${name}, confirm this is your email address to finish setting up your Shiru account.`,
    action: "Verify email",
    link,
    footer:
      "You received this because someone signed up for Shiru with this address. If that wasn't you, you can ignore this email.",
  });
}

export function sendPasswordResetEmail({
  to,
  name,
  link,
}: {
  to: string;
  name: string;
  link: string;
}) {
  return send(to, "Reset your password", {
    preview: "Reset your Shiru password",
    heading: "Reset your password",
    body: `Hi ${name}, use the button below to choose a new password for your Shiru account. The link expires in one hour.`,
    action: "Reset password",
    link,
    footer:
      "You received this because someone asked to reset the password for this address. If that wasn't you, you can ignore this email.",
  });
}

export function sendInvitationEmail({
  to,
  inviter,
  organization,
  link,
}: {
  to: string;
  inviter: string;
  organization: string;
  link: string;
}) {
  return send(to, `Join ${organization} on Shiru`, {
    preview: `${inviter} invited you to ${organization}`,
    heading: `Join ${organization}`,
    body: `${inviter} invited you to join ${organization} on Shiru.`,
    action: "Accept invitation",
    link,
    footer:
      "You received this because someone invited this address to Shiru. If you weren't expecting it, you can ignore this email.",
  });
}
