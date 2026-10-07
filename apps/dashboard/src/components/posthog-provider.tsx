import { PostHogProvider as BasePostHogProvider } from "@posthog/react";
import posthog from "posthog-js";
import { type ReactNode, useEffect, useRef } from "react";

import { authClient } from "@/lib/auth-client";

const key = import.meta.env.DEV ? undefined : import.meta.env.VITE_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com",
    ui_host: "https://us.posthog.com",
    defaults: "2026-08-30",
    capture_exceptions: true,
  });
}

function IdentifyUser() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const identifiedId = useRef<string>(undefined);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, { email: user.email });
    } else if (identifiedId.current) {
      posthog.reset();
    }
    identifiedId.current = user?.id;
  }, [user?.id, user?.email]);

  return null;
}

export default function PostHogProvider({ children }: { children: ReactNode }) {
  return (
    <BasePostHogProvider client={posthog}>
      {key && <IdentifyUser />}
      {children}
    </BasePostHogProvider>
  );
}
