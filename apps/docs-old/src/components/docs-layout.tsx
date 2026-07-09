import { Link } from "@tanstack/react-router";

import type { DocsManifest, SidebarItem } from "@/lib/content/types";

export function DocsLayout({
  manifest,
  children,
}: {
  manifest: DocsManifest;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[oklch(97%_0.012_205)] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-slate-200/80 bg-[oklch(95%_0.015_205)] px-6 py-8 lg:border-r">
          <Link to="/" className="text-sm font-semibold tracking-tight text-slate-950">
            Shiru Docs
          </Link>
          <nav className="mt-8 space-y-1 text-sm">
            {manifest.items.map((item) => (
              <SidebarNode key={item.href} item={item} />
            ))}
          </nav>
        </aside>
        <main className="min-w-0 px-6 py-10 lg:px-12">{children}</main>
      </div>
    </div>
  );
}

function SidebarNode({ item }: { item: SidebarItem }) {
  return (
    <div>
      <Link
        to={item.href}
        className="block rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-white hover:text-slate-950"
        activeProps={{ className: "bg-white text-cyan-800 shadow-sm" }}
      >
        {item.title}
      </Link>
      {item.children.length > 0 ? (
        <div className="ml-3 border-l border-slate-200 pl-3">
          {item.children.map((child) => (
            <SidebarNode key={child.href} item={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
