import { notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import * as z from "zod";

import {
  CanonicalRedirect,
  DocumentArticle,
  InvalidDocumentError,
  loadDocument,
  NotFoundError,
} from "@/lib/document-request";

export const getPublishedDocument = createServerFn({ method: "GET" })
  .validator(z.object({ path: z.string() }))
  .handler(async ({ data }) => {
    try {
      const document = await loadDocument(getRequest(), env, data.path);
      return {
        Document: await renderServerComponent(<DocumentArticle document={document} />),
        description: document.description,
        title: document.title,
      };
    } catch (error) {
      if (error instanceof CanonicalRedirect) {
        throw redirect({ href: error.location });
      }
      if (error instanceof NotFoundError) {
        setResponseStatus(404);
        throw notFound();
      }

      console.error("docs.server_component_failed", error);
      setResponseStatus(500);
      throw new InvalidDocumentError("Unable to render document");
    }
  });
