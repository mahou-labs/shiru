import { render } from "@react-email/components";
// import OrgInviteEmail from "@/emails/org-invite";
// import PasswordResetEmail from "@/emails/password-reset";
// import { env } from "./env";
import { env } from "cloudflare:workers";

// import ApplicationReceivedEmail from "@/emails/application-received";
import EmailVerificationEmail from "@/emails/email-verification";

// export const sendPasswordResetEmail = async ({
//   email,
//   name,
//   resetLink,
// }: {
//   email: string;
//   name: string;
//   resetLink: string;
// }) => {
//   await resend.emails.send({
//     from: "Shiru <no-reply@shiru.sh>",
//     to: [email],
//     subject: "Reset your password",
//     react: <PasswordResetEmail name={name} resetLink={resetLink} />,
//   });
// };

export const sendVerificationEmail = async ({
  to,
  name,
  verificationLink,
}: {
  to: string;
  name: string;
  verificationLink: string;
}) => {
  const htmlString = await render(
    <EmailVerificationEmail name={name} verificationLink={verificationLink} />,
  );

  const textString = await render(
    <EmailVerificationEmail name={name} verificationLink={verificationLink} />,
    { plainText: true },
  );

  const { messageId } = await env.EMAIL.send({
    from: "Shiru <no-reply@shiru.sh>",
    to,
    subject: "Verify your email address",
    html: htmlString,
    text: textString,
  });

  console.log({ htmlString, textString, messageId });
};

// export const sendApplicationReceivedEmail = async ({
//   email,
//   candidateName,
//   jobTitle,
//   organizationName,
// }: {
//   email: string;
//   candidateName: string;
//   jobTitle: string;
//   organizationName: string;
// }) => {
//   await resend.emails.send({
//     from: "Shiru <no-reply@shiru.sh>",
//     to: [email],
//     subject: `Application received: ${jobTitle}`,
//     react: (
//       <ApplicationReceivedEmail
//         candidateName={candidateName}
//         jobTitle={jobTitle}
//         organizationName={organizationName}
//       />
//     ),
//   });
// };

// export const sendOrgInvite = async ({
//   email,
//   invitedByUsername,
//   invitedByEmail,
//   teamName,
//   inviteLink,
// }: {
//   email: string;
//   invitedByUsername: string;
//   invitedByEmail: string;
//   teamName: string;
//   inviteLink: string;
// }) => {
//   await resend.emails.send({
//     from: "Nicolas - Shiru <nicolas@shiru.sh>",
//     to: [email],
//     subject: "You've been invited to join an organization",
//     react: (
//       <OrgInviteEmail
//         invitedBy={invitedByUsername}
//         invitedByEmail={invitedByEmail}
//         inviteLink={inviteLink}
//         name={email}
//         organization={teamName}
//       />
//     ),
//   });
// };
