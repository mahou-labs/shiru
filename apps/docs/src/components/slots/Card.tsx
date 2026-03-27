import type { ReactNode } from "react";

interface CardProps {
  title: string;
  href?: string;
  children: ReactNode;
}

export default function Card({ title, href, children }: CardProps) {
  const content = (
    <div
      style={{
        backgroundColor: "var(--color-bg-card, oklch(99% 0.005 205))",
        border: "1px solid var(--color-border, oklch(88% 0.015 205))",
        borderRadius: "8px",
        padding: "1.25rem",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "oklch(52% 0.15 205)";
        e.currentTarget.style.boxShadow = "0 2px 8px oklch(0% 0 0 / 0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "oklch(88% 0.015 205)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <h3
        style={{
          fontSize: "1.05rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
          color: "var(--color-text, oklch(20% 0.02 205))",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontSize: "0.9rem",
          lineHeight: 1.6,
          color: "var(--color-text-secondary, oklch(40% 0.015 205))",
        }}
      >
        {children}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: "none", color: "inherit" }}>
        {content}
      </a>
    );
  }

  return content;
}
