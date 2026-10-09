import type { APIRoute } from "astro";
import { page } from "../content";

export const GET: APIRoute = () =>
  new Response(
    `# ${page.name}

> ${page.hero.subhead}

## Pages

- [${page.name}](${page.origin}/index.md): What Shiru is, how it serves people and agents, and how to join the waitlist.
`,
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
