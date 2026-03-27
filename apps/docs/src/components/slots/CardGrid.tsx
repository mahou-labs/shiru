import type { ReactNode } from "react";

interface CardGridProps {
  columns?: 2 | 3;
  children: ReactNode;
}

export default function CardGrid({ columns = 2, children }: CardGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      {children}
    </div>
  );
}
