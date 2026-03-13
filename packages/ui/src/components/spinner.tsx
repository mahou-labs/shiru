import { IconLoaderOutline18 } from "nucleo-ui-outline-18";
import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

type IconProps = ComponentProps<typeof IconLoaderOutline18>;

function Spinner({ className, ...props }: IconProps) {
  return (
    <IconLoaderOutline18
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      role="status"
      {...props}
    />
  );
}

export { Spinner };
