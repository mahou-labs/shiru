FROM node:24.21.0-trixie-slim

COPY --from=docker.io/cloudflare/sandbox:1.0.0 /usr/local/bin/sandbox-shim /usr/local/bin/sandbox-shim

# Builds run with no network, so every dependency is installed here.
WORKDIR /builder/template
COPY packages/site-template/package.json packages/site-template/package-lock.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force

COPY packages/site-template/ ./
COPY apps/builder/src/ /builder/src/

# build-site imports zod, which resolves from the template's node_modules.
RUN ln -s /builder/template/node_modules /builder/node_modules \
  && chmod +x /builder/src/build-site.ts /builder/src/dist-manifest.ts \
  && ln -s /builder/src/build-site.ts /usr/local/bin/build-site \
  && ln -s /builder/src/dist-manifest.ts /usr/local/bin/dist-manifest

WORKDIR /
