// Copy wraps code, paths and URLs in backticks. The page renders them as <code>
// and the Markdown serializer keeps them as code spans.
export type Rich = string;

export type Item = { title: string; body: Rich };

// Headings wrap their closing phrase in asterisks. The page sets it in italic serif and the
// Markdown serializer keeps it as emphasis.
export type Heading = string;

export type Feature = Item & { visual: "mdx" | "commits" | "head" | "gfm" | "urls" };

export type Step = Item & { visual: "tree" | "terminal" | "urls" };

export type Section =
  | { kind: "agents"; id: "agents"; heading: Heading; lead: Rich; points: Item[] }
  | { kind: "how"; id: "how"; heading: Heading; steps: Step[] }
  | { kind: "features"; heading: Heading; features: Feature[] }
  | {
      kind: "openSource";
      id: "open-source";
      heading: Heading;
      blocks: (Item & { link?: { label: string; href: string } })[];
    }
  | { kind: "faq"; id: "faq"; heading: Heading; entries: { question: string; answer: Rich }[] }
  | { kind: "cta"; heading: Heading; body: string };

const apiUrl: string =
  import.meta.env.PUBLIC_API_URL ??
  (import.meta.env.DEV ? "http://localhost:3000" : "https://api.shiru.sh");

export type Page = {
  origin: string;
  name: string;
  title: string;
  hero: {
    heading: Heading;
    subhead: string;
    note: string;
    demo: Rich;
    demoLabel: string;
  };
  nav: { label: string; href: `#${string}` }[];
  links: {
    waitlist: string;
    waitlistApi: string;
    github: string;
    x: { href: string; handle: string };
  };
  sections: Section[];
  footer: { tagline: string; copyright: string };
};

const github = "https://github.com/mahou-labs/shiru";

export const page: Page = {
  origin: "https://shiru.sh",
  name: "Shiru",
  title: "Shiru: docs your users’ AI agents can actually read",
  hero: {
    heading: "Docs your users’ AI agents *can actually read.*",
    subhead:
      "Shiru is the open-source alternative to Mintlify. Every page ships twice: a fast site for people, and clean Markdown with an llms.txt index for their coding agents.",
    note: "Pre-launch. One email when Shiru ships, nothing else.",
    demo: "The page opens with an illustrative demo: a coding agent reads a docs site’s `llms.txt`, then one Markdown page, answers from it, and applies the fix.",
    demoLabel: "Illustrative example. Acme is a made-up company.",
  },
  nav: [
    { label: "Agents", href: "#agents" },
    { label: "How it works", href: "#how" },
    { label: "Open source", href: "#open-source" },
    { label: "FAQ", href: "#faq" },
  ],
  links: {
    waitlist: "https://shiru.sh/#waitlist",
    waitlistApi: `${apiUrl}/rpc/waitlist/join`,
    github,
    x: { href: "https://x.com/nchartiot", handle: "@nchartiot" },
  },
  sections: [
    {
      kind: "agents",
      id: "agents",
      heading: "Every page, in the format *each reader wants.*",
      lead: "People get a fast, server-rendered docs site. Agents get the same page as plain Markdown, at the same URL plus `.md`. No scraping, no guessing where the content starts.",
      points: [
        {
          title: "Markdown at every URL",
          body: "Add `.md` to any page and get clean Markdown back.",
        },
        {
          title: "An llms.txt index",
          body: "One file lists every page, so an agent finds what it needs in a single request.",
        },
        {
          title: "Discoverable by default",
          body: "Every page links to its Markdown version in its HTML head.",
        },
      ],
    },
    {
      kind: "how",
      id: "how",
      heading: "Write in your repo. *Publish on push.*",
      steps: [
        {
          title: "Write MDX",
          body: "Markdown you already know, plus React components when a page needs them.",
          visual: "tree",
        },
        {
          title: "Push",
          body: "Every published version is a Git commit. Your docs history is your repo history.",
          visual: "terminal",
        },
        {
          title: "Read anywhere",
          body: "Your docs go live at `your-team.shiru.sh` for people, and as Markdown for agents.",
          visual: "urls",
        },
      ],
    },
    {
      kind: "features",
      heading: "Everything a docs site needs. *Nothing you’ll fight.*",
      features: [
        {
          visual: "mdx",
          title: "MDX with your components",
          body: "Import your own React components into any page.",
        },
        {
          visual: "commits",
          title: "Your content stays in Git",
          body: "Docs are files in your repository. Leaving is a `git clone`.",
        },
        {
          visual: "head",
          title: "Server-rendered, with a Markdown twin",
          body: "Readers get HTML, not a JavaScript app. Each page takes its title and description from frontmatter and links to its Markdown version.",
        },
        {
          visual: "gfm",
          title: "GitHub-flavored Markdown",
          body: "Tables, task lists, strikethrough and autolinks.",
        },
        {
          visual: "urls",
          title: "Clean URLs and anchors",
          body: "Links to `.mdx` files become clean paths. Headings get stable anchors.",
        },
      ],
    },
    {
      kind: "openSource",
      id: "open-source",
      heading: "Open source, and *priced per team.*",
      blocks: [
        {
          title: "Open source",
          body: "The docs engine moves into the public repository before launch. Run it on your own infrastructure or use the hosted version at shiru.sh. Your content stays in your repo either way.",
          link: { label: "Follow along on GitHub", href: github },
        },
        {
          title: "Per organization, not per seat",
          body: "One price for your whole team, so everyone can fix a typo. Plans and prices are published at launch.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      heading: "Questions, *answered.*",
      entries: [
        {
          question: "How is Shiru different from Mintlify?",
          answer:
            "Both turn MDX into a docs site. Shiru is open source, can be self-hosted, is priced per organization instead of per seat, and treats agents as first-class readers with Markdown at every URL and an `llms.txt` index.",
        },
        {
          question: "What exactly do agents get?",
          answer:
            "The same content your readers see, as Markdown. Add `.md` to any page URL, or start from `/llms.txt`, which lists every page.",
        },
        {
          question: "Do I have to rewrite my docs?",
          answer:
            "If they’re Markdown, mostly not. MDX is Markdown with optional components. Give each page a title in its frontmatter and you can publish.",
        },
        {
          question: "Can I self-host?",
          answer:
            "Yes. The engine moves into the public repository before launch, and you can run it on your own infrastructure.",
        },
        {
          question: "When does Shiru launch?",
          answer:
            "We’re building it now. Join the waitlist and we’ll send one email when it ships.",
        },
        {
          question: "How much will it cost?",
          answer:
            "Pricing is per organization, not per seat. Plans and prices are published at launch.",
        },
      ],
    },
    {
      kind: "cta",
      heading: "Give both of your readers *the good version.*",
      body: "Join the waitlist. One email when Shiru ships.",
    },
  ],
  footer: {
    tagline: "Docs for people and agents.",
    copyright: "© 2026 Mahou Labs",
  },
};
