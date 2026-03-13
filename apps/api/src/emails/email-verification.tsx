import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
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
      <Tailwind>
        <Head>
          <style>{`
            .btn-primary:hover {
              background-color: rgb(29 78 216);
            }
            .link-primary:hover {
              color: rgb(30 64 175);
            }
          `}</style>
        </Head>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-2xl px-4 py-8">
            {/* Header */}
            <Section className="mb-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <span className="text-2xl">✉️</span>
                </div>
                <Heading className="mb-2 font-bold text-3xl text-gray-900">
                  Verify Your Email
                </Heading>
                <Text className="text-gray-600 text-lg">Welcome to Shiru, {name}!</Text>
              </div>
            </Section>

            {/* Main Content */}
            <Section className="mb-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <Text className="mb-6 text-base text-gray-700 leading-relaxed">
                Thanks for signing up! Please verify your email address to complete your account
                setup and start using Shiru.
              </Text>

              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-6">
                <Text className="mt-0 mb-2 font-medium text-green-800 text-sm">
                  Why verify your email?
                </Text>
                <ul className="mb-0 list-disc space-y-1 pl-4 text-green-700 text-sm">
                  <li>Secure your account and protect your data</li>
                  <li>Receive important notifications and updates</li>
                  <li>Enable password recovery if needed</li>
                </ul>
              </div>

              <div className="text-center">
                <Button
                  className="btn-primary inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-decoration-none text-white shadow-sm transition-colors duration-200"
                  href={verificationLink}
                >
                  Verify Email Address
                </Button>
              </div>

              <Text className="mt-6 text-center text-gray-500 text-sm">
                Or copy and paste this link in your browser:
              </Text>
              <Link
                className="link-primary block break-all text-center text-blue-600 text-sm"
                href={verificationLink}
              >
                {verificationLink}
              </Link>
            </Section>

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-gray-500 text-xs leading-relaxed">
                This email was sent because an account was created with this email address on Shiru.
                <br />
                If you didn't create this account, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

EmailVerificationEmail.PreviewProps = {
  name: "John Doe",
  verificationLink: "https://app.mizuhr.com/auth/verify-email?token=abc123",
};
