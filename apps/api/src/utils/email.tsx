import { render } from "@react-email/components";
import { env } from "cloudflare:workers";

import EmailVerificationEmail from "../emails/email-verification";

export async function sendVerificationEmail({
  to,
  name,
  verificationLink,
}: {
  to: string;
  name: string;
  verificationLink: string;
}) {
  const email = <EmailVerificationEmail name={name} verificationLink={verificationLink} />;
  await env.EMAIL.send({
    from: "Shiru <no-reply@shiru.sh>",
    to,
    subject: "Verify your email address",
    html: await render(email),
    text: await render(email, { plainText: true }),
  });
}
