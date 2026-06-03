# Jogi sablon-vázlatok — JOGÁSZ VALIDÁLJA LAUNCH ELŐTT

> **FIGYELMEZTETÉS:** Az alábbi dokumentum-vázlatok informatív célra készültek.
> Nem minősülnek jogi tanácsadásnak. ESMA és MNB szabályozás szerint
> minden dokumentumot engedélyezett jogász validálásával kell véglegesíteni
> a célpiacra (EU tagállamok) való indítás előtt.

## Szükséges jogi dokumentumok (launch előtt kötelező):

1. **Általános Szerződési Feltételek (ÁSZF / T&C)**
   - Rebate-keretezés: "megemelt első havi rebate" — NEM "fizess be, kapsz X"
   - Jutalék feltételei: csak broker-megerősített FTD + qualifying volume után
   - Clawback feltételek
   - Felelősségkorlátozás

2. **Adatvédelmi Tájékoztató (GDPR)**
   - Adatkezelő: [cégadatok]
   - Kezelt adatok: Telegram felhasználói adatok, kereskedési adatok
   - Adatmegőrzési idő
   - Érintetti jogok (hozzáférés, törlés, helyesbítés)
   - EU adatfeldolgozók listája

3. **Kockázati Tájékoztató (Risk Disclosure)**
   - Kötelező ESMA szövegezés (retail CFD veszteségráta %)
   - Tőkevesztés kockázata
   - "Tools, not tips" keretezés
   - Nincs befektetési tanács

4. **Affiliate Disclosure**
   - Egyértelmű közlés: az Rebound affiliate jutalékot kap a brokertől
   - A rebate az affiliate jutalék visszaosztása
   - Nem függetlenek a brokertől

5. **Broker engedélyezés ellenőrzése**
   - A partner broker ESMA-engedélyének verifikálása
   - Célpiacok listájának jogi review-ja

## Kötelező kockázati figyelmeztetés minden felületen:

```
A CFD-ek és forex kereskedés magas kockázattal jár, és tőkéje elveszítésével járhat.
A kiskereskedelmi CFD-számlák X%-a veszít pénzt. [X = valós broker adat]
Ez nem befektetési tanács. Rebound eszközöket kínál, nem javaslatokat.
```

## Generált vázlatok (jogász validálja)

Az alábbi szerkeszthető `.docx` vázlatok elkészültek (forrás: `scripts/build_legal_docs.py`,
seed: `packages/shared/src/compliance.ts`). Mindegyik a kötelező *„JOGÁSZ VALIDÁLJA LAUNCH ELŐTT"*
piros bannerrel, `[ ]` helykitöltőkkel a cégadatoknak / ESMA %-nak:

| # | Dokumentum | Fájl |
|---|------------|------|
| 1 | Általános Szerződési Feltételek (ÁSZF / T&C) | `docs/legal/01-ASZF-TC.docx` |
| 2 | Adatvédelmi Tájékoztató (GDPR) | `docs/legal/02-Adatvedelem-GDPR.docx` |
| 3 | Kockázati Tájékoztató (Risk Disclosure) | `docs/legal/03-Kockazati-Tajekoztato.docx` |
| 4 | Affiliate Disclosure | `docs/legal/04-Affiliate-Disclosure.docx` |

> A `.docx` formátum szándékos: a jogász track-changes-szel szerkesztheti. A véglegesítést
> követően ezekből készülnek a publikus PDF-ek.

**LAUNCH GATE: Jogi jóváhagyás nélkül nem indítható.**
