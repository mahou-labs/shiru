<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->

## Design Context

### Users

Solo/indie developers and startup teams (2-20 people), both technical and
non-technical. They're building products and need documentation that works for
humans and AI agents. Context: fast-moving, time-constrained, want to write
docs once and have them just work.

### Brand Personality

Approachable + Confident + Premium. Think Stripe's polish with Notion's warmth.
Not cold or intimidating, but not playful/casual either. The interface should
feel like a tool made by people who care deeply about craft.

Three words: Considered. Warm. Sharp.

### Aesthetic Direction

Evolving toward a cohesive identity across marketing site and dashboard.
References: Mintlify (competitor to beat on polish), Linear/Vercel (design
precision). Anti-references: generic SaaS admin panels, AI-generated dark
landing pages, template-driven design.

Light mode as default. Dark mode as a first-class alternative, not the
personality driver.

### Brand Color

**Cyan** — OKLCH hue 205, blue-leaning cyan. Distinct from Mintlify (green),
Linear (purple), GitBook/ReadMe (blue). Professional yet distinctive.

Token reference (dashboard `index.css`):

- Light primary: `oklch(52% 0.15 205)`
- Dark primary: `oklch(75% 0.13 205)`
- Neutral tint: all grays carry hue 205 at low chroma (0.01-0.02)
- Surfaces: background `oklch(97% 0.012 205)`, sidebar `oklch(95% 0.015 205)`

### Typography

**Geist** (by Vercel) for all text. Loaded from Google Fonts.

- `--font-sans` / `--font-heading`: Geist
- `--font-mono`: Geist Mono
- Heading differentiation via weight (600-700) and size, not a second font family.

### Design Principles

1. **Content is the product** — The editor and documentation are the core
   experience. Every UI decision should make writing and reading better.
2. **Earned complexity** — Start simple, reveal depth through interaction.
   Non-technical users should never feel overwhelmed.
3. **Identity through restraint** — One strong brand color, one distinctive
   typeface, consistent spacing. Personality comes from precision, not effects.
4. **States are experiences** — Empty, loading, error, and success states are
   design opportunities, not afterthoughts.
5. **Both audiences, one voice** — Technical enough for developers, clear
   enough for everyone else.
