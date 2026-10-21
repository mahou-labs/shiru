FROM node:24.21.0-trixie-slim

COPY --from=docker.io/cloudflare/sandbox:1.0.0 /usr/local/bin/sandbox-shim /usr/local/bin/sandbox-shim

# Builds run with no network, so the site template's dependencies are installed here. A doc's repo
# holds the rest of the template, and build-site links these node_modules into it. Builds only run
# astro, so the image skips the template's Vite+ dev tooling.
WORKDIR /builder/template
COPY packages/site-template/package.json packages/site-template/pnpm-lock.yaml packages/site-template/pnpm-workspace.yaml ./
RUN npm install -g pnpm@12.9.1 \
  && pnpm install --frozen-lockfile --prod \
  && rm -rf "$(pnpm store path)" /root/.cache/pnpm \
  && npm uninstall -g pnpm && npm cache clean --force

COPY apps/builder/src/ /builder/src/

# build-site imports zod, which resolves from the template's node_modules.
RUN ln -s /builder/template/node_modules /builder/node_modules \
  && chmod +x /builder/src/build-site.ts /builder/src/dist-manifest.ts \
  && ln -s /builder/src/build-site.ts /usr/local/bin/build-site \
  && ln -s /builder/src/dist-manifest.ts /usr/local/bin/dist-manifest

WORKDIR /
