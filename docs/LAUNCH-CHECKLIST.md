# Rebound Launch Checklist

> **Státusz-jelölés** · `[x]` kódban implementálva és ellenőrizve ·
> `[~]` részleges / vázlat (befejezésre vár) · `[ ]` függőben (futásidő / külső /
> jogi — kódból nem ellenőrizhető).
> Utolsó kód-ellenőrzés: **2026-06-03**.
>
> **LAUNCH GATE: jogi jóváhagyás nélkül NEM indítható.**

## Compliance & Jog
- [x] Risk warning a landingen, botban, mini-appban — `index.astro`, `bot/src/index.ts`, `Wallet/Onboarding/RiskCoach.tsx`
- [x] Nincs "garantált profit" / befektetési tanács sehol — UI grep tiszta; tiltólista: `compliance.ts` `FORBIDDEN_PHRASES`
- [ ] T&C **jogász által jóváhagyva** a célpiacra — vázlat kész (`docs/legal/01-ASZF-TC.docx`), validálás függőben
- [ ] GDPR adatvédelmi tájékoztató **jogász által jóváhagyva** — vázlat kész (`02-Adatvedelem-GDPR.docx`)
- [ ] Risk disclosure **jogász által jóváhagyva** (ESMA % valós adat) — vázlat kész (`03-Kockazati-Tajekoztato.docx`)
- [~] Affiliate disclosure minden felületen — szöveg + dokumentum kész (`04-Affiliate-Disclosure.docx`); minden felületre bekötés ellenőrzendő
- [ ] Csak engedélyezett célpiacon elérhető (geoblocking) — `ALLOWED_COUNTRIES` definiált, **még nincs bekötve**
- [ ] Partner broker ESMA-engedély verifikálva — külső, jogi review

## Technikai (NON-NEGOTIABLE)
- [x] Rebate CSAK cash, SOHA nem trade-locked — `rebate.ts` `isPayable: true`; wallet badge "CASH · NEM TRADE-LOCKED" · *(futásidejű E2E teszt: `[ ]`)*
- [x] initData HMAC ellenőrzés MINDEN endpointon — `hooks/auth.ts` `preHandler`, csak `PUBLIC_PATHS` kivétel
- [x] Wallet ledger append-only — kódban kizárólag `.create` (nincs `update`/`delete`); séma dokumentálja
- [x] Jutalom CSAK broker-megerősített FTD + qualifying volume után — `cpa-reconciliation.ts` `verifyFtdWithBroker` (MT/IB), OCR sosem old fel
- [x] Clawback mechanizmus implementálva — `cpa-reconciliation.ts` `clawbackCpaEvent` (append-only DEBIT) · *(futásidejű teszt: `[ ]`)*
- [~] Fraud dedup: telefon / wallet / eszköz / IP — jelek + admin review UI + OCR `MANUAL_FLAG` kész; **signup-idői detekciós logika hiányzik**

## Security
- [x] Rate limiting minden endpointon — `@fastify/rate-limit` (100 / perc), `index.ts`
- [ ] HTTPS kötelező (Telegram WebApp) — platform-szintű (Cloudflare/Vercel/Render), prod-on ellenőrizendő
- [x] CORS csak engedélyezett originkre — `@fastify/cors` + `helmet`, `CORS_ORIGINS`
- [ ] No PII in logs — naplózási audit függőben
- [x] .env.example naprakész, .env gitignore-ban — `.gitignore` `*.env`; `.env.example` frissítve (MT/OCR gateway, SERVICE)

## Infrastruktúra
- [~] EU régió: DB, Redis, PII-service — konfigurálva (Neon/Upstash/Render Frankfurt, `render.yaml`); provisionálás futásidőben
- [ ] Prisma migrate deploy lefutott production-re — `docker-entrypoint.sh` futtatja az api boot-kor; prod futás függőben
- [ ] Bot webhook regisztrálva a publikus API URL-re — futásidő (`docs/DEPLOY.md` §5)
- [ ] Sentry monitoring aktív — `SENTRY_DSN` env definiált, **kód-bekötés hiányzik**
- [ ] Backup tesztelve (DB restore) — futásidő (Neon PITR)

## UX / QA
- [~] Mobile reszponzív — landing + miniapp reszponzív CSS kész; Telegram in-app böngésző teszt függőben
- [ ] Lighthouse score > 90 — futásidejű mérés
- [ ] a11y audit átment — futásidejű audit
- [ ] Payout flow end-to-end tesztelve — UI kész (`Payout.tsx`, admin `Payouts.tsx`); E2E futásidő
- [~] On-chain USDC TX hash megjelenik a payout history-ban — UI mező kész (`Payout.tsx`, admin TX input); valós tx-szel ellenőrzendő

---

### Összegzés
- **Kódban kész és ellenőrzött (`[x]`):** 9 tétel — a NON-NEGOTIABLE technikai gate-ek nagy része (cash-rebate, HMAC, append-only ledger, FTD-gate, clawback, rate-limit, CORS, risk-warning, no-forbidden-phrases).
- **Részleges (`[~]`):** 5 tétel — fraud dedup detekció, affiliate-bekötés, EU-régió provision, mobil QA, on-chain tx megjelenítés.
- **Függőben (`[ ]`):** jogi validáció (gate), geoblocking-bekötés, Sentry-bekötés, broker-engedély, és minden futásidejű/külső teszt.

> A launch **csak** akkor engedélyezett, ha minden `[ ]` jogi és NON-NEGOTIABLE
> tétel `[x]`-re vált, és a jogász a négy dokumentumot validálta.
