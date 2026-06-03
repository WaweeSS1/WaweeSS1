# FX·King Launch Checklist

## Compliance & Jog
- [ ] Risk warning a landingen, botban, mini-appban — LÁTHATÓ, nem apró betű
- [ ] Nincs "garantált profit" / befektetési tanács sehol
- [ ] T&C **jogász által jóváhagyva** a célpiacra
- [ ] GDPR adatvédelmi tájékoztató **jogász által jóváhagyva**
- [ ] Risk disclosure **jogász által jóváhagyva** (ESMA-kompatibilis %)
- [ ] Affiliate disclosure minden felületen
- [ ] Csak engedélyezett célpiacon elérhető (geoblocking)
- [ ] Partner broker ESMA-engedély verifikálva

## Technikai (NON-NEGOTIABLE)
- [ ] Rebate CSAK cash, SOHA nem trade-locked — tesztelve
- [ ] initData HMAC ellenőrzés MINDEN endpointon
- [ ] Wallet ledger append-only (nem módosítható, nem törölhető)
- [ ] Jutalom CSAK broker-megerősített FTD + qualifying volume után
- [ ] Clawback mechanizmus tesztelve (CPA visszavonás → ledger reversal)
- [ ] Fraud dedup: telefon / wallet / eszköz / IP dedup aktív

## Security
- [ ] Rate limiting minden endpointon
- [ ] HTTPS kötelező (Telegram WebApp megköveteli)
- [ ] CORS csak engedélyezett originkra
- [ ] No PII in logs
- [ ] .env.example naprakész, .env gitignore-ban

## Infrastruktúra
- [ ] EU régió: DB, Redis, minden PII-t kezelő service
- [ ] Prisma migrate deploy lefutott production-re
- [ ] Bot webhook regisztrálva a publikus API URL-re
- [ ] Sentry monitoring aktív
- [ ] Backup tesztelve (DB restore)

## UX / QA
- [ ] Mobile reszponzív — Telegram in-app böngészőben tesztelve
- [ ] Lighthouse score > 90
- [ ] a11y audit átment
- [ ] Payout flow end-to-end tesztelve
- [ ] On-chain USDC TX hash megjelenik a payout history-ban
