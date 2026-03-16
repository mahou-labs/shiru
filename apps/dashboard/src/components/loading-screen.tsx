import { Spinner } from "@shiru/ui/spinner";

export function LoadingScreen() {
  return (
    <main className="flex h-screen items-center justify-center bg-background">
      <Spinner />
    </main>
  );
}
