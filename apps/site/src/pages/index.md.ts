import type { APIRoute } from "astro";
import { page } from "../content";
import { toMarkdown } from "../markdown";

export const GET: APIRoute = () =>
  new Response(toMarkdown(page), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
