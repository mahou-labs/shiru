globalThis.process ??= {};
globalThis.process.env ??= {};
import {
  T as createComponent,
  c as renderSlot,
  g as addAttribute,
  h as renderHead,
  i as renderComponent,
  m as maybeRenderHead,
  u as renderTemplate,
  w as createAstro,
} from "./server_COv7-vJj.mjs";
import "./compiler_C0TtrD-Z.mjs";
//#region src/components/Header.astro
createAstro();
const $$Header = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$props, $$slots);
    Astro2.self = $$Header;
    const tenant = Astro2.locals.tenant;
    const siteTitle = tenant?.orgSlug ? `${tenant.orgSlug} docs` : "Documentation";
    return renderTemplate`${maybeRenderHead($$result)}<header class="docs-header"> <button class="mobile-menu-toggle" aria-label="Toggle navigation" onclick="document.querySelector('.docs-sidebar')?.classList.toggle('open')"> <svg width="20" height="20" viewBox="0 0 20 20" fill="none"> <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path> </svg> </button> <div class="header-title"> <a href="/">${siteTitle}</a> </div> </header>`;
  },
  "/home/nchartiot/Code/shiru/apps/docs/src/components/Header.astro",
  void 0,
);
//#endregion
//#region src/components/Sidebar.astro
createAstro();
const $$Sidebar = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$props, $$slots);
    Astro2.self = $$Sidebar;
    const { groups = [] } = Astro2.props;
    const currentPath = Astro2.url.pathname;
    return renderTemplate`${maybeRenderHead($$result)}<aside class="docs-sidebar"> <nav aria-label="Documentation"> ${
      groups.length > 0
        ? groups.map(
            (group) =>
              renderTemplate`<div class="sidebar-group"> <div class="sidebar-group-label">${group.label}</div> <ul class="sidebar-items"> ${group.items.map(
                (item) => {
                  const href = `/${item.slug}`;
                  const isCurrent = currentPath === href || currentPath === `${href}/`;
                  return renderTemplate`<li class="sidebar-item"> <a${addAttribute(href, "href")}${addAttribute(isCurrent ? "page" : void 0, "aria-current")}> ${item.title} </a> </li>`;
                },
              )} </ul> </div>`,
          )
        : renderTemplate`<p style="font-size: var(--text-sm); color: var(--color-text-muted);">
No navigation configured.
</p>`
    } </nav> </aside>`;
  },
  "/home/nchartiot/Code/shiru/apps/docs/src/components/Sidebar.astro",
  void 0,
);
//#endregion
//#region src/components/Footer.astro
const $$Footer = createComponent(
  ($$result, $$props, $$slots) => {
    return renderTemplate`${maybeRenderHead($$result)}<footer class="docs-footer"> <p>Powered by <a href="https://shiru.dev" target="_blank" rel="noopener noreferrer">Shiru</a></p> </footer>`;
  },
  "/home/nchartiot/Code/shiru/apps/docs/src/components/Footer.astro",
  void 0,
);
//#endregion
//#region src/components/TableOfContents.astro
createAstro();
const $$TableOfContents = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$props, $$slots);
    Astro2.self = $$TableOfContents;
    const { headings } = Astro2.props;
    const filteredHeadings = headings.filter((h) => h.depth >= 2 && h.depth <= 3);
    return renderTemplate`${maybeRenderHead($$result)}<div class="docs-toc"> ${filteredHeadings.length > 0 && renderTemplate`<nav aria-label="Table of contents"> <div class="toc-title">On this page</div> <ul class="toc-list"> ${filteredHeadings.map((heading) => renderTemplate`<li${addAttribute(`depth-${heading.depth}`, "class")}> <a${addAttribute(`#${heading.slug}`, "href")}>${heading.text}</a> </li>`)} </ul> </nav>`} </div>`;
  },
  "/home/nchartiot/Code/shiru/apps/docs/src/components/TableOfContents.astro",
  void 0,
);
//#endregion
//#region src/layouts/DocsLayout.astro
createAstro();
const $$DocsLayout = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$props, $$slots);
    Astro2.self = $$DocsLayout;
    const { title, description, headings = [], sidebar = [] } = Astro2.props;
    return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description"${addAttribute(description, "content")}><title>${title}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">${renderHead($$result)}</head> <body> <div class="docs-shell"> ${renderComponent($$result, "Header", $$Header, {})} ${renderComponent($$result, "Sidebar", $$Sidebar, { groups: sidebar })} <main class="docs-content"> ${renderSlot($$result, $$slots["default"])} </main> ${renderComponent($$result, "TableOfContents", $$TableOfContents, { headings: headings })} ${renderComponent($$result, "Footer", $$Footer, {})} </div> </body></html>`;
  },
  "/home/nchartiot/Code/shiru/apps/docs/src/layouts/DocsLayout.astro",
  void 0,
);
//#endregion
export { $$DocsLayout as t };
