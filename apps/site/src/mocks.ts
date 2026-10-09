// Illustrative source shown inside product mocks. Acme is a made-up company.

export const webhookHandler = `import express from "express";
import { acme } from "../lib/acme";
import { archiveCustomer, markInvoicePaid } from "../billing";

export const webhooks = express.Router();

webhooks.post("/webhooks/acme", async (req, res) => {
  // TODO: verify signature
  const event = JSON.parse(req.rawBody);

  switch (event.type) {
    case "invoice.paid":
      await markInvoicePaid(event.data.id);
      break;
    case "customer.deleted":
      await archiveCustomer(event.data.id);
      break;
  }

  res.sendStatus(204);
});`;

export const verifyAnswer = `const event = acme.webhooks.verify(
  req.rawBody,
  req.header("Acme-Signature"),
  process.env.ACME_WEBHOOK_SECRET,
);`;

export const quickstartMarkdown = `---
title: Quickstart
description: Install the SDK.
---

# Quickstart

Install the Acme SDK and send your
first request.

\`\`\`sh
npm install @acme/sdk
\`\`\`

> Keep your API key on the server.
> Never ship it to the browser.`;

export const llmsTxt = `# Acme

> Payments API for developers.

- [Quickstart](/quickstart.md)
- [Webhooks](/webhooks.md)
- [Errors](/errors.md)`;

export const calloutMdx = `import { Callout } from "../components";

# Webhooks

<Callout type="warning">
  Verify signatures before parsing the body.
</Callout>`;

export const headHtml = `<head>
  <meta charset="utf-8">
  <title>Webhooks - Acme Docs</title>
  <meta name="description"
    content="Verify and handle Acme events.">
  <link rel="alternate"
    type="text/markdown"
    href="/webhooks.md">
</head>`;

export const linksMdx = `See [Webhooks](./webhooks.mdx).

## Verify signatures`;
