import { IconLoaderOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import type React from "react";
import { cn } from "cn";

export function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof IconLoaderOutlineDuo18>): React.ReactElement {
  return (
    <IconLoaderOutlineDuo18
      aria-label="Loading"
      className={cn("animate-spin", className)}
      role="status"
      {...props}
    />
  );
}
