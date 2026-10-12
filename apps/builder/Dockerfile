FROM node:24.21.0-trixie-slim

COPY --from=docker.io/cloudflare/sandbox:1.0.0 /usr/local/bin/sandbox-shim /usr/local/bin/sandbox-shim

# Builds run with no network, so every dependency is installed here.
WORKDIR /builder/template
COPY template/package.json template/package-lock.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force

COPY template/ ./
COPY src/ /builder/src/

# build-site imports satteri, zod and yaml. They resolve from the template's
# node_modules, so the MDX check runs the same parser version Astro compiles with.
RUN ln -s /builder/template/node_modules /builder/node_modules \
  && chmod +x /builder/src/build-site.ts \
  && ln -s /builder/src/build-site.ts /usr/local/bin/build-site

WORKDIR /
