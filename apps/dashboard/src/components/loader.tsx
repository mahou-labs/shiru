import { IconLoaderOutline18 } from "nucleo-ui-outline-18";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <IconLoaderOutline18 className="animate-spin text-muted-foreground" />
    </div>
  );
}
