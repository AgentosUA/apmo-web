# syntax=docker/dockerfile:1

# Node.js 26 — current Active LTS (since 2026-10-28, supported until 2029-04).
ARG NODE_VERSION=26
# pnpm major used for the lockfile (see "packageManager" in package.json).
ARG PNPM_VERSION=12.10.1

# ---------- base ----------
FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
# Corepack is no longer bundled with Node.js 25+, install pnpm with npm.
RUN npm install -g pnpm@${PNPM_VERSION} && pnpm --version
WORKDIR /app

# ---------- dependencies ----------
FROM base AS deps
# sharp / Next SWC need glibc compat on Alpine for some prebuilt binaries.
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

# ---------- build ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined at build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STATIC_URL
ARG NEXT_PUBLIC_OCAP_URL
ARG NEXT_PUBLIC_OCAP_URLS
ARG NEXT_PUBLIC_OCAP_MAPS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STATIC_URL=$NEXT_PUBLIC_STATIC_URL
ENV NEXT_PUBLIC_OCAP_URL=$NEXT_PUBLIC_OCAP_URL
ENV NEXT_PUBLIC_OCAP_URLS=$NEXT_PUBLIC_OCAP_URLS
ENV NEXT_PUBLIC_OCAP_MAPS_URL=$NEXT_PUBLIC_OCAP_MAPS_URL

RUN pnpm build

# ---------- runtime ----------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone output: minimal server + only the node_modules it needs.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

CMD ["node", "server.js"]
