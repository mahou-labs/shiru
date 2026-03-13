import { IconLoaderOutlineDuo18 } from "nucleo-ui-outline-duo-18";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <IconLoaderOutlineDuo18 className="animate-spin text-muted-foreground" />
    </div>
  );
}
