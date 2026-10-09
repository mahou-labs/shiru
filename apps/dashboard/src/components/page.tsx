import { Separator } from "@shiru/ui/components/separator";
import { SidebarTrigger } from "@shiru/ui/components/sidebar";
import type { ReactNode } from "react";

type PageProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function Page({ title, description, children }: PageProps) {
  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ms-1" />
        <Separator orientation="vertical" className="me-1 h-4" />
        <span className="font-medium text-sm">{title}</span>
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
        <div>
          <h1 className="font-heading font-semibold text-2xl">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {children}
      </div>
    </>
  );
}
