import type { ReactNode } from "react";

declare global {
  interface Window {
    $ujq: unknown[];
    uj: Record<string, (...args: unknown[]) => void>;
  }
}

if (typeof window !== "undefined" && import.meta.env.VITE_USERJOT_ID) {
  window.$ujq = window.$ujq || [];
  window.uj =
    window.uj ||
    new Proxy({} as Window["uj"], {
      get:
        (_, p: string) =>
        (...a: unknown[]) =>
          window.$ujq.push([p, ...a]),
    });

  const script = document.createElement("script");
  script.src = "https://cdn.userjot.com/sdk/v2/uj.js";
  script.type = "module";
  script.async = true;
  document.head.appendChild(script);

  window.uj.init(import.meta.env.VITE_USERJOT_ID, {
    widget: false,
  });
}

export default function UserJotProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

const showWidget = (section?: string) => {
  console.log(window.uj, section);

  window.uj?.showWidget?.({ section });
};
const hideWidget = () => window.uj?.hideWidget?.();

export function useUserJot() {
  return { showWidget, hideWidget };
}
