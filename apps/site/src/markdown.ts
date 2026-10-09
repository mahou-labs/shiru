import type { Item, Page, Section } from "./content";

const list = (items: Item[]) => items.map((item) => `- **${item.title}**: ${item.body}`).join("\n");

function section(page: Page, s: Section): string {
  switch (s.kind) {
    case "agents":
      return `## ${s.heading}\n\n${s.lead}\n\n${list(s.points)}`;
    case "how":
      return `## ${s.heading}\n\n${s.steps.map((step, i) => `${i + 1}. **${step.title}**: ${step.body}`).join("\n")}`;
    case "features":
      return `## ${s.heading}\n\n${list(s.features)}`;
    case "openSource":
      return [
        `## ${s.heading}`,
        ...s.blocks.map((block) =>
          [
            `### ${block.title}`,
            block.body,
            block.link && `[${block.link.label}](${block.link.href})`,
          ]
            .filter(Boolean)
            .join("\n\n"),
        ),
      ].join("\n\n");
    case "faq":
      return [`## ${s.heading}`, ...s.entries.map((e) => `### ${e.question}\n\n${e.answer}`)].join(
        "\n\n",
      );
    case "cta":
      return `## ${s.heading}\n\n${s.body}\n\nJoin the waitlist at ${page.links.waitlist}.`;
  }
}

export function toMarkdown(page: Page): string {
  return `${[
    `# ${page.hero.heading}`,
    page.hero.subhead,
    `Join the waitlist at ${page.links.waitlist}.`,
    page.hero.demo,
    ...page.sections.map((s) => section(page, s)),
    `## Links`,
    [
      `- [GitHub](${page.links.github})`,
      `- [X: ${page.links.x.handle}](${page.links.x.href})`,
      `- [llms.txt](${page.origin}/llms.txt)`,
    ].join("\n"),
    page.footer.copyright,
  ].join("\n\n")}\n`;
}
