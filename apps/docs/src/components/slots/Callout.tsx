import type { ReactNode } from "react";

interface CalloutProps {
  type?: "note" | "tip" | "warning" | "danger";
  title?: string;
  children: ReactNode;
}

const icons: Record<string, string> = {
  note: "\u2139\uFE0F",
  tip: "\u2728",
  warning: "\u26A0\uFE0F",
  danger: "\uD83D\uDED1",
};

const colors: Record<string, { bg: string; border: string; title: string }> = {
  note: {
    bg: "oklch(95% 0.03 205)",
    border: "oklch(52% 0.15 205)",
    title: "oklch(42% 0.15 205)",
  },
  tip: {
    bg: "oklch(95% 0.03 145)",
    border: "oklch(52% 0.12 145)",
    title: "oklch(42% 0.12 145)",
  },
  warning: {
    bg: "oklch(95% 0.04 80)",
    border: "oklch(60% 0.15 80)",
    title: "oklch(45% 0.12 80)",
  },
  danger: {
    bg: "oklch(95% 0.03 25)",
    border: "oklch(55% 0.15 25)",
    title: "oklch(42% 0.15 25)",
  },
};

export default function Callout({ type = "note", title, children }: CalloutProps) {
  const palette = colors[type] ?? colors.note;
  const icon = icons[type] ?? icons.note;
  const displayTitle = title ?? type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div
      style={{
        backgroundColor: palette.bg,
        borderLeft: `3px solid ${palette.border}`,
        borderRadius: "6px",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "0.875rem",
          color: palette.title,
          marginBottom: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span>{icon}</span>
        <span>{displayTitle}</span>
      </div>
      <div style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}
