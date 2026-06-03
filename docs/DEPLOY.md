# FX·King — Deploy Guide

> **LAUNCH GATE:** Production launch is blocked until legal validation is complete
> (see `docs/legal/LEGAL-NOTICE.md`). This guide is the technical path only.

## Topology

| Surface | Platform | Why |
|---|---|---|
| Landing (Astro static) | **Cloudflare Pages** | Free static hosting, edge CDN, `_headers`/`_redirects` |
| Mini App (React/Vite) | **Vercel** | SPA, must stay embeddable in Telegram webview |
| Admin (React/Vite) | **Vercel** | SPA, locked down (`X-Frame-Options: DENY`) |
| API (Fastify) | **Render** (web) | EU region (Frankfurt), Docker |
| Bot (grammY) | **Render** (worker) | Long-running |
| broker-sync (cron) | **Render** (worker) | Scheduled trade sync / CPA reconcile |
| Database | **Neon** | Serverless Postgres, EU region, Prisma-friendly |
| Redis | **Upstash** | Serverless Redis, EU region |

The three backend services share one **`Dockerfile`**; `docker-entrypoint.sh`
dispatches on the `SERVICE` env var (`api` / `bot` / `broker-sync`), so the image
is portable to **Railway** or **Fly.io** unchanged.

## 1. Provision data stores (EU region — GDPR)

1. **Neon**: create project `fxking` in `eu-central-1`. Copy the **pooled** URL →
   `DATABASE_URL` and the **direct** URL → `DIRECT_URL`.
2. **Upstash**: create a Redis DB in an EU region → `REDIS_URL`.

## 2. Backend (Render)

1. Render → **New → Blueprint** → point at this repo. `render.yaml` provisions
   `fxking-api` (web) + `fxking-bot` + `fxking-broker-sync` (workers).
2. Fill the **`fxking-shared`** env group with the values from `.env.example`
   (DB, Redis, `BOT_TOKEN`, broker gateway keys, etc.).
3. First deploy runs `prisma migrate deploy` automatically (api entrypoint).
4. Health check: `GET /health` on the api service.

> The native **MT4/5 Manager API** is Windows C++ — it cannot run in these Linux
> containers. Run it behind an HTTPS bridge that consumes `MT4_MANAGER_*` and
> exposes deals; point `MT_GATEWAY_URL`/`MT_GATEWAY_KEY` at that bridge.

## 3. Frontends

- **Landing (Cloudflare Pages)**: project `fxking-landing`, build
  `npx turbo run build --filter=@fxking/landing`, output `apps/landing/dist`.
  Enable "include files outside root" for the monorepo install.
- **Mini App / Admin (Vercel)**: one project each, **Root Directory** =
  `apps/miniapp` / `apps/admin`, enable **Include source files outside the Root
  Directory** (needed for `@fxking/shared`). Set `VITE_API_URL` /
  `VITE_ADMIN_API_URL`. `vercel.json` handles SPA rewrites + headers.

## 4. CI/CD (GitHub Actions)

- **`ci.yml`** — typecheck + lint + build on every push/PR.
- **`deploy.yml`** — on push to `main`, deploys each surface **only if its
  secret is set** (graceful skip otherwise).

Repository secrets:

| Secret | Used by |
|---|---|
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Landing |
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_MINIAPP_PROJECT_ID`, `VERCEL_ADMIN_PROJECT_ID` | Mini App / Admin |
| `RENDER_DEPLOY_HOOK_API`, `RENDER_DEPLOY_HOOK_BOT`, `RENDER_DEPLOY_HOOK_BROKER_SYNC` | Backend |

## 5. Telegram wiring

1. `@BotFather` → set the Mini App URL to the Vercel mini app domain.
2. Set the bot webhook to `https://<api-domain>/telegram/webhook`.
3. Verify Mini App `initData` HMAC validation passes against `BOT_TOKEN`.

## 6. Post-deploy compliance checks

Run `docs/LAUNCH-CHECKLIST.md`. Do **not** flip to production traffic until:
- Risk warning renders on every surface,
- rewards are gated on broker-confirmed FTD (verify with a test account),
- legal documents are lawyer-validated and linked.
