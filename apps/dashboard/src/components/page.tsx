import { useSidebar } from "@/contexts/sidebar-context";
import { useModifierKey } from "@/hooks/use-modifier-key";
import { Button } from "@shiru/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@shiru/ui/breadcrumb";
import { Kbd, KbdGroup } from "@shiru/ui/kbd";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@shiru/ui/tooltip";
import { IconLayoutLeftOutline18 } from "nucleo-ui-outline-18";
import { Fragment, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { SearchBar } from "./search-bar";

type PageProps = {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function Page({ children, title, description, actions }: PageProps) {
  return (
    <>
      <PageHeader />
      <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
        <PageTitle title={title} description={description} actions={actions} />
        {children}
      </div>
    </>
  );
}

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  settings: "Settings",
  organization: "Organization",
  account: "Account",
  overview: "Overview",
};

function useBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string }[] = [{ label: "Dashboard", href: "/" }];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;

    const label = routeLabels[segment];
    if (label) {
      crumbs.push({ label, href: currentPath });
    } else if (segment.length > 8) {
      // Likely a UUID or ID, skip it
      continue;
    } else {
      crumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
      });
    }
  }

  return crumbs;
}

function PageHeader() {
  const { toggleSidebar } = useSidebar();
  const modifierKey = useModifierKey();
  const breadcrumbs = useBreadcrumbs();

  return (
    <div className="sticky top-0 z-10 flex w-full items-center gap-2 border-b bg-background px-6 py-4">
      <Tooltip>
        <TooltipTrigger delay={0}>
          <Button className="text-muted-foreground p-1" onClick={toggleSidebar} variant="link">
            <IconLayoutLeftOutline18 />
          </Button>
        </TooltipTrigger>
        <TooltipPopup>
          <KbdGroup>
            <Kbd>{modifierKey}</Kbd>
            <Kbd>B</Kbd>
          </KbdGroup>
        </TooltipPopup>
      </Tooltip>

      {breadcrumbs.length > 1 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <Fragment key={crumb.href}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink render={<Link to={crumb.href} />}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="ml-auto">
        <SearchBar />
      </div>
    </div>
  );
}

function PageTitle({ title, description, actions }: Omit<PageProps, "children">) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-heading text-2xl">{title}</h1>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
