<div align="center">
  <a href="https://shiru.sh">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.svg">
      <img src=".github/assets/logo-light.svg" alt="Shiru logo" width="72" height="72">
    </picture>
  </a>
  <h1>Shiru</h1>
  <p><strong>Open-source docs for people and the agents that read them.</strong></p>
  <p>
    <a href="https://shiru.sh">Website</a>
    ·
    <a href="#run-shiru-locally">Run locally</a>
    ·
    <a href="CONTRIBUTING.md">Contributing</a>
    ·
    <a href="https://x.com/nchartiot">X</a>
  </p>
  <p>
    <a href="https://github.com/mahou-labs/shiru/actions/workflows/ci.yml"><img src="https://github.com/mahou-labs/shiru/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
  </p>
</div>

Shiru is an open-source documentation platform, and an alternative to Mintlify. You write MDX and publish it as a docs site that works for two kinds of readers: people in a browser and coding agents that need clean source.

> [!NOTE]
> Shiru is pre-launch. The hosted service at [shiru.sh](https://shiru.sh) isn't open yet. Join the waitlist there to hear when it is.

## Why Shiru

- **Agents read the source.** Every page has a Markdown version next to its HTML, and `llms.txt` indexes the whole site. An agent fetches the Markdown instead of scraping HTML.
- **Your docs stay yours.** Every site is a Git repository of MDX files, and each published version is a commit. You can also run Shiru yourself.
- **Priced per organization, not per seat.** The whole team can fix a typo without anyone counting seats.

Sites build on [Nimbus](https://nimbus-docs.com/), so any MDX that Nimbus accepts builds on Shiru.

## Run Shiru locally

You need the following:

- [Vite+](https://viteplus.dev), the `vp` command. It installs the right Node.js and pnpm versions for you.
- To create and publish docs sites, [Docker](https://docs.docker.com/get-docker/) and the `cf` CLI signed in to a Cloudflare account. Sign-up, organizations and billing work without them. [Docs traffic](CONTRIBUTING.md#docs-traffic) explains why.
- A [Polar sandbox](https://sandbox.polar.sh) access token and webhook secret. Sign-up creates a Polar customer, so you can't create an account without them.
- A [Nucleo](https://nucleoapp.com) license key in `NUCLEO_LICENSE_KEY`. The icon package checks it during install.

1. Install Vite+:

   ```bash
   curl -fsSL https://vite.plus | bash
   ```

   On Windows, run `irm https://vite.plus/ps1 | iex` in PowerShell.

2. Clone the repository and install the dependencies:

   ```bash
   git clone https://github.com/mahou-labs/shiru.git
   cd shiru
   vp install
   ```

3. Create `apps/api/.env` with your secrets:

   ```dotenv
   BETTER_AUTH_SECRET=<at least 32 random characters>
   POLAR_ACCESS_TOKEN=<Polar sandbox access token>
   POLAR_WEBHOOK_SECRET=<Polar sandbox webhook secret>
   ```

4. Create `apps/dashboard/.env`:

   ```dotenv
   VITE_API_URL=http://localhost:3000
   ```

5. Start the apps:

   ```bash
   vp run dev
   ```

6. The first time, leave the apps running and create the database tables from a second terminal:

   ```bash
   vp run db:push
   ```

Open the dashboard at http://localhost:3001 and sign up. Shiru doesn't send real email in development. To find the verification link, open the local Cloudflare explorer at http://localhost:3000/cdn-cgi/local/explorer.

The API runs at http://localhost:3000 and the marketing site at http://localhost:3002. A published docs site with the slug `acme` is served at http://acme.docs.localhost:3003.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for how the code is organized, how to run checks and tests, and how Shiru is deployed. [docs-platform-architecture.md](docs-platform-architecture.md) explains the publishing design in depth.
