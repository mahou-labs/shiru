import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type EmailVerificationProps = {
  name: string;
  verificationLink: string;
};

export default function EmailVerificationEmail({ name, verificationLink }: EmailVerificationProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Confirm your email to finish setting up Shiru</Preview>
      <Tailwind>
        <Body className="m-0 bg-[#fafafa] py-10 font-sans text-[#0a0a0a]">
          <Container className="mx-auto max-w-[480px] px-4">
            <Text className="m-0 mb-6 text-[18px] font-semibold tracking-tight">Shiru</Text>
            <Section className="rounded-[10px] border border-solid border-[#e5e5e5] bg-white px-8 py-8">
              <Heading className="m-0 text-[22px] font-semibold leading-[30px] tracking-tight">
                Verify your email
              </Heading>
              <Text className="mt-3 mb-6 text-[15px] leading-[24px] text-[#404040]">
                Hi {name}, confirm this is your email address to finish setting up your Shiru
                account.
              </Text>
              <Button
                href={verificationLink}
                className="rounded-[8px] bg-[#171717] px-5 py-3 text-[14px] font-medium text-[#fafafa]"
              >
                Verify email
              </Button>
              <Hr className="my-8 border-[#e5e5e5]" />
              <Text className="m-0 text-[13px] leading-[20px] text-[#737373]">
                Button not working? Paste this link into your browser:
              </Text>
              <Link
                href={verificationLink}
                className="text-[13px] leading-[20px] break-all text-[#171717] underline"
              >
                {verificationLink}
              </Link>
            </Section>
            <Text className="mt-6 mb-0 text-center text-[12px] leading-[18px] text-[#a3a3a3]">
              You received this because someone signed up for Shiru with this address. If that
              wasn't you, you can ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

EmailVerificationEmail.PreviewProps = {
  name: "Ada",
  verificationLink: "http://localhost:3000/auth/verify-email?token=abc123",
};
