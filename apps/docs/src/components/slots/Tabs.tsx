import { useState, type ReactNode } from "react";

interface TabItem {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
}

export default function Tabs({ items }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid oklch(88% 0.015 205)",
          gap: "0",
        }}
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.label}
              onClick={() => setActiveIndex(index)}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "oklch(52% 0.15 205)" : "oklch(55% 0.01 205)",
                background: "none",
                border: "none",
                borderBottom: isActive ? "2px solid oklch(52% 0.15 205)" : "2px solid transparent",
                cursor: "pointer",
                transition: "color 0.15s ease, border-color 0.15s ease",
                marginBottom: "-1px",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "1rem 0" }}>{items[activeIndex]?.content}</div>
    </div>
  );
}
