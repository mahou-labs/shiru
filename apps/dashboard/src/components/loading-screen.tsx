import { Spinner } from "@shiru/ui/spinner";

export function LoadingScreen() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
      <Spinner className="size-5 text-primary" />
    </main>
  );
}
