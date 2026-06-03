# ─────────────────────────────────────────────────────────────────────────
# Shared Dockerfile for Rebound backend services (api | bot | broker-sync).
# Pick the service at runtime with the SERVICE env var. Portable across
# Render / Railway / Fly.io.
# ─────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS base
ENV PNPM_HOME=/usr/local/bin
WORKDIR /app
# OpenSSL is required by Prisma engines.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ── deps: install workspace dependencies (cached on lockfile) ──
FROM base AS deps
COPY package.json package-lock.json* turbo.json ./
COPY apps ./apps
COPY services ./services
COPY packages ./packages
RUN npm ci

# ── build: generate Prisma client, then build all backend workspaces ──
FROM deps AS build
RUN npm run db:generate
RUN npx turbo run build --filter=@rebound/api --filter=@rebound/bot --filter=@rebound/broker-sync

# ── runtime ──
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
# Entry point dispatches to the chosen service.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["docker-entrypoint.sh"]
