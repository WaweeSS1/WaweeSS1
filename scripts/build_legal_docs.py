#!/usr/bin/env python3
"""
FX·King legal document stub generator.

Produces 4 editable .docx drafts in docs/legal/ for lawyer validation:
  1. ASZF (T&C)              2. Adatvedelmi Tajekoztato (GDPR)
  3. Kockazati Tajekoztato   4. Affiliate Disclosure

Every document carries a NON-DISMISSIBLE "JOGASZ VALIDALJA LAUNCH ELOTT"
banner. Content is seeded from packages/shared/src/compliance.ts and is a
DRAFT only — not legal advice.

Run:  python3 scripts/build_legal_docs.py
"""
import os
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

AMBER = RGBColor(0xB0, 0x76, 0x00)
RED   = RGBColor(0xC0, 0x1A, 0x1A)
SLATE = RGBColor(0x0D, 0x11, 0x17)
GREY  = RGBColor(0x55, 0x5B, 0x62)

VERSION = "v0.1 DRAFT"
DATE = "2026-06-03"

def shade(cell, hex_):
    tcPr = cell._tc.get_or_add_tcPr()
    sh = OxmlElement("w:shd"); sh.set(qn("w:val"), "clear")
    sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), hex_)
    tcPr.append(sh)

def base_doc(title, subtitle):
    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Calibri"; style.font.size = Pt(10.5)
    for section in doc.sections:
        section.top_margin = Inches(0.8); section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.9); section.right_margin = Inches(0.9)

    # ── Warning banner (single-cell shaded table) ──
    t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.rows[0].cells[0]; shade(c, "C01A1A")
    p = c.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("⚠  JOGÁSZ VALIDÁLJA LAUNCH ELŐTT  —  VÁZLAT, NEM JOGI TANÁCS  ⚠")
    r.bold = True; r.font.size = Pt(11); r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    doc.add_paragraph()

    h = doc.add_heading(title, level=0)
    for run in h.runs: run.font.color.rgb = SLATE
    sp = doc.add_paragraph(); sr = sp.add_run(subtitle)
    sr.italic = True; sr.font.color.rgb = GREY; sr.font.size = Pt(10)

    # Metadata table
    mt = doc.add_table(rows=4, cols=2); mt.style = "Light Grid Accent 1"
    meta = [("Verzió", VERSION), ("Dátum", DATE),
            ("Státusz", "VÁZLAT — engedélyezett jogász validálása szükséges"),
            ("Célpiac", "[EU tagállam(ok) — jogi review tölti ki] · ESMA / MNB hatály")]
    for i, (k, v) in enumerate(meta):
        mt.rows[i].cells[0].text = k
        mt.rows[i].cells[0].paragraphs[0].runs[0].bold = True
        mt.rows[i].cells[1].text = v
    doc.add_paragraph()
    return doc

def h2(doc, text):
    h = doc.add_heading(text, level=1)
    for run in h.runs: run.font.color.rgb = AMBER
    return h

def para(doc, text, bold=False, color=None):
    p = doc.add_paragraph(); r = p.add_run(text)
    r.bold = bold
    if color: r.font.color.rgb = color
    return p

def bullet(doc, text):
    doc.add_paragraph(text, style="List Bullet")

def placeholder_note(doc):
    p = doc.add_paragraph()
    r = p.add_run("[ ] = jogi review / cégadat tölti ki.")
    r.italic = True; r.font.size = Pt(9); r.font.color.rgb = GREY

def footer_disclaimer(doc):
    doc.add_paragraph()
    p = doc.add_paragraph()
    r = p.add_run("Ez a dokumentum vázlat, kizárólag belső előkészítő célra. Nem minősül "
                  "jogi tanácsadásnak, és nem helyettesíti engedélyezett jogász általi "
                  "validálást. Forrás-konstansok: packages/shared/src/compliance.ts.")
    r.italic = True; r.font.size = Pt(8.5); r.font.color.rgb = GREY

# Shared compliance text
RISK_SHORT = ("A CFD-ek és a forex (deviza) kereskedés magas kockázattal jár, és a "
              "befektetett tőke teljes elvesztésével járhat. A kiskereskedelmi CFD-számlák "
              "[ESMA %]-a veszít pénzt ennél a szolgáltatónál. Ez nem befektetési tanács. "
              "Az FX·King eszközöket kínál, nem javaslatokat (Tools, not tips).")

# ════════════════════════════════════════════════════════════════════════════
# 1 — ÁSZF / T&C
# ════════════════════════════════════════════════════════════════════════════
def build_tc():
    doc = base_doc("Általános Szerződési Feltételek (ÁSZF)",
                   "FX·King — cashback-alapú forex affiliate companion · Telegram Mini App")
    placeholder_note(doc)

    h2(doc, "1. Bevezetés és a szolgáltatás jellege")
    para(doc, "1.1. Az FX·King-et a [CÉGNÉV] ([cégjegyzékszám], [székhely]) üzemelteti "
              "(„Szolgáltató”). Az FX·King egy companion eszköz, amely partner-brokereknél "
              "végzett kereskedés után cashback (rebate) visszatérítést és kapcsolódó "
              "eszközöket (napló, kalkulátor, kockázati coach) nyújt.")
    para(doc, "1.2. Az FX·King NEM broker, NEM befektetési szolgáltató, és NEM ad "
              "befektetési tanácsot. A kereskedés a partner-broker felületén, a broker "
              "szabályzata szerint történik.", bold=True)
    para(doc, "1.3. A rebate az affiliate jutalék felhasználónak visszaosztott része "
              "(lásd: Affiliate Disclosure).")

    h2(doc, "2. Rebate (cashback) — kifizetési feltételek")
    para(doc, "2.1. A rebate KÉSZPÉNZ jellegű jóváírás, amely NEM trade-locked: "
              "kifizetése nem köthető további kereskedési volumenhez.", bold=True, color=AMBER)
    bullet(doc, "Standard rebate: $1.20 / lot. VIP rebate: $1.60 / lot. (Hangolható, lásd compliance.)")
    bullet(doc, "A rebate a broker által visszaigazolt és elszámolt lot-volumen alapján kerül jóváírásra.")
    bullet(doc, "Minimális kifizetés: $20. Kifizetési módok: [USDC BEP-20 / banki átutalás].")
    bullet(doc, "A wallet egyenleg append-only főkönyvön alapul; a jóváírások auditálhatók.")

    h2(doc, "3. Jutalmak (welcome / referral) — feltételhez kötött")
    para(doc, "3.1. A welcome cash ($100) és a referral cash ($80) jutalom KIZÁRÓLAG "
              "a broker által megerősített első befizetés (FTD) ÉS a minősítő kereskedési "
              "volumen teljesülése UTÁN szabadul fel.", bold=True, color=AMBER)
    para(doc, "3.2. A welcome cash keretezése: „megemelt első havi rebate” — NEM "
              "„fizess be és kapsz X” típusú ösztönző.", bold=True)
    bullet(doc, "Puszta regisztráció kizárólag XP-t (pontot) adhat, készpénzt NEM.")
    bullet(doc, "Referral jutalom csak qualified FTD-vel rendelkező meghívott után jár.")

    h2(doc, "4. Clawback (visszavonás)")
    para(doc, "4.1. Ha a partner-broker visszavonja a CPA-t (pl. chargeback, csalás, a "
              "minősítő feltételek meg nem felelése miatt), a kapcsolódó jutalom "
              "visszaíródik a felhasználó főkönyvén (append-only DEBIT tétel).", bold=True)
    bullet(doc, "A már kifizetett, de utóbb visszavont jutalom a [feltételek] szerint követelhető vissza.")
    bullet(doc, "A clawback nem érinti a jogszerűen, ténylegesen kereskedett volumen utáni rebate-et.")

    h2(doc, "5. Csalásmegelőzés és fiókhasználat")
    para(doc, "5.1. A Szolgáltató deduplikációs jelzéseket alkalmaz (telefon, wallet-cím, "
              "eszköz, IP) a visszaélés és a self-referral kiszűrésére.")
    bullet(doc, "Tiltott: multi-accounting, hamis FTD, bot-szerű kereskedés a jutalom kicsalására.")
    bullet(doc, "A Szolgáltató jogosult a jutalmat visszatartani / fiókot felfüggeszteni gyanú esetén.")

    h2(doc, "6. Felelősségkorlátozás és kockázat")
    para(doc, RISK_SHORT, color=RED)
    para(doc, "6.1. A Szolgáltató nem felel a felhasználó kereskedési veszteségeiért. "
              "Az eszközök (napló, kalkulátor, coach) tájékoztató jellegűek.")

    h2(doc, "7. Felmondás, módosítás, jogviták")
    bullet(doc, "A Szolgáltató [X] napos értesítéssel módosíthatja az ÁSZF-et.")
    bullet(doc, "Irányadó jog: [tagállam]. Joghatóság: [bíróság]. Fogyasztói jogok fenntartva.")
    bullet(doc, "Kapcsolat / panasz: [email] · Adatkezelési kérdések: lásd GDPR tájékoztató.")

    footer_disclaimer(doc)
    return doc

# ════════════════════════════════════════════════════════════════════════════
# 2 — GDPR
# ════════════════════════════════════════════════════════════════════════════
def build_gdpr():
    doc = base_doc("Adatvédelmi Tájékoztató (GDPR)",
                   "FX·King — a természetes személyek adatainak kezeléséről (GDPR 2016/679)")
    placeholder_note(doc)

    h2(doc, "1. Adatkezelő")
    bullet(doc, "Adatkezelő: [CÉGNÉV], [székhely], [cégjegyzékszám].")
    bullet(doc, "Kapcsolat / adatvédelmi tisztviselő (DPO, ha kötelező): [email].")

    h2(doc, "2. Kezelt adatok köre")
    bullet(doc, "Telegram azonosító adatok: Telegram user ID, felhasználónév, nyelvi kód (initData-ból, HMAC-kal hitelesítve).")
    bullet(doc, "Broker-kapcsolat: broker login (read-only), kereskedési adatok (lot, pár, P&L, időbélyeg).")
    bullet(doc, "Kifizetési adatok: wallet-cím / IBAN (kizárólag a kifizetéshez).")
    bullet(doc, "Technikai adatok: eszköz- és IP-jelzők (csalásmegelőzés céljából).")

    h2(doc, "3. Az adatkezelés céljai és jogalapja")
    bullet(doc, "Szolgáltatás nyújtása (rebate-számítás, wallet) — szerződés teljesítése [GDPR 6(1)(b)].")
    bullet(doc, "Csalásmegelőzés (dedup: telefon/wallet/eszköz/IP) — jogos érdek [GDPR 6(1)(f)].")
    bullet(doc, "Jogszabályi megfelelés (AML/KYC, ha alkalmazandó) — jogi kötelezettség [GDPR 6(1)(c)].")
    bullet(doc, "Kcommunikáció / marketing — kizárólag hozzájárulás alapján [GDPR 6(1)(a)], visszavonható.")

    h2(doc, "4. Adatmegőrzés")
    bullet(doc, "Számviteli / kifizetési adatok: [jogszabályi megőrzési idő, pl. 8 év].")
    bullet(doc, "Kereskedési és wallet főkönyv: a jogviszony + [X] év (append-only, audit).")
    bullet(doc, "Csalásmegelőzési jelzők: [X] hónap, majd törlés/anonimizálás.")

    h2(doc, "5. Adatfeldolgozók és adattovábbítás")
    para(doc, "Az alábbi feldolgozók [adatfeldolgozói szerződéssel] működnek közre. EU-n "
              "kívüli továbbítás esetén megfelelő garancia (SCC) szükséges:")
    bullet(doc, "Hosting / DB: [Neon / Supabase — régió: EU].")
    bullet(doc, "Cache / queue: [Upstash — régió].")
    bullet(doc, "Backend / bot hosting: [Railway / Render / Fly.io — régió].")
    bullet(doc, "Partner-broker: kereskedési adatok forrása (önálló adatkezelő lehet).")

    h2(doc, "6. Érintetti jogok")
    bullet(doc, "Hozzáférés, helyesbítés, törlés („elfeledtetés”), korlátozás, adathordozhatóság, tiltakozás.")
    bullet(doc, "Hozzájárulás bármikor visszavonható (a korábbi kezelés jogszerűségét nem érinti).")
    bullet(doc, "Panasz: [NAIH / illetékes felügyeleti hatóság], elérhetőség: [link].")
    bullet(doc, "Kérelmek: [email]. Válaszadási határidő: [GDPR szerint 1 hónap].")

    footer_disclaimer(doc)
    return doc

# ════════════════════════════════════════════════════════════════════════════
# 3 — KOCKÁZATI TÁJÉKOZTATÓ
# ════════════════════════════════════════════════════════════════════════════
def build_risk():
    doc = base_doc("Kockázati Tájékoztató (Risk Disclosure)",
                   "FX·King — kötelező kockázati közlés minden felületen")

    # Big risk box
    t = doc.add_table(rows=1, cols=1); c = t.rows[0].cells[0]; shade(c, "FBE9E7")
    p = c.paragraphs[0]
    r = p.add_run(RISK_SHORT); r.bold = True; r.font.color.rgb = RED; r.font.size = Pt(11)
    doc.add_paragraph()
    placeholder_note(doc)

    h2(doc, "1. A tőkevesztés kockázata")
    para(doc, "A CFD és forex termékek tőkeáttételesek. A piaci mozgás a befektetett "
              "összeget meghaladó veszteséget is okozhat (a broker negatív egyenleg "
              "védelmétől függően). Csak olyan tőkével kereskedj, amelynek elvesztését "
              "megengedheted magadnak.")

    h2(doc, "2. Kötelező ESMA szövegezés")
    para(doc, "A kiskereskedelmi befektetői CFD-számlák [ESMA %]-a veszít pénzt ennél a "
              "szolgáltatónál. (A [ESMA %] a partner-broker valós, közzétett adatából "
              "töltendő ki, és rendszeresen frissítendő.)", bold=True)

    h2(doc, "3. Tools, not tips — nincs befektetési tanács")
    para(doc, "Az FX·King eszközöket kínál (kereskedési napló, pozícióméret-kalkulátor, "
              "kockázati coach, cashback-követés), NEM befektetési tanácsot, NEM "
              "kereskedési jelzéseket, és NEM hozamígéretet.", bold=True, color=AMBER)
    bullet(doc, "Tilos a „garantált profit”, „kockázatmentes”, „biztos hozam” típusú állítás.")
    bullet(doc, "A megjelenített számítások (pl. rebate-becslés) tájékoztató jellegűek.")
    bullet(doc, "A kockázati coach korlátai (pl. napi veszteséglimit) figyelmeztetnek, de nem akadályozzák meg a veszteséget.")

    h2(doc, "4. A cashback nem ösztönöz túlkereskedésre")
    para(doc, "A rebate a ténylegesen kereskedett volumen utáni költségvisszatérítés. "
              "NEM cél a kereskedési gyakoriság növelése. Az FX·King anti-revenge-trading "
              "jelzéseket is megjelenít.", color=AMBER)

    h2(doc, "5. Megértés visszaigazolása")
    para(doc, "Az onboarding során a felhasználónak kötelező jelölőnégyzettel meg kell "
              "erősítenie, hogy elolvasta és megértette ezt a kockázati tájékoztatót, "
              "mielőtt a szolgáltatást használni kezdi.")

    footer_disclaimer(doc)
    return doc

# ════════════════════════════════════════════════════════════════════════════
# 4 — AFFILIATE DISCLOSURE
# ════════════════════════════════════════════════════════════════════════════
def build_affiliate():
    doc = base_doc("Affiliate Disclosure (Partneri Közlés)",
                   "FX·King — az FX·King és a partner-broker viszonyának átlátható közlése")
    placeholder_note(doc)

    h2(doc, "1. Egyértelmű közlés")
    para(doc, "Az FX·King affiliate (partneri) jutalékot kap a partner-broker(ek)től azon "
              "felhasználók kereskedése után, akik az FX·King-en keresztül regisztrálnak / "
              "kapcsolódnak. Az FX·King ennek megfelelően anyagilag érdekelt.", bold=True, color=AMBER)

    h2(doc, "2. A rebate forrása")
    bullet(doc, "A felhasználónak fizetett rebate az affiliate jutalék (RevShare) visszaosztott része.")
    bullet(doc, "RevShare gross: ~$2.40 / lot (a broker-nettó ~30%-a). Ebből térül vissza a $1.20–$1.60 / lot rebate.")
    bullet(doc, "A CPA ($600 / qualified FTD) a welcome / referral jutalmak és a működés fedezete.")

    h2(doc, "3. Függetlenség hiánya")
    para(doc, "Az FX·King NEM független a partner-brokertől a jutalék mértékéig. Az "
              "eszközök és tartalmak nem minősülnek pártatlan befektetési ajánlásnak.", bold=True)

    h2(doc, "4. Broker engedélyezés")
    bullet(doc, "A partner-broker(ek) ESMA / [illetékes] engedélyét launch előtt verifikálni kell.")
    bullet(doc, "Csak engedélyezett, a célpiacon jogszerűen működő broker használható partnerként.")
    bullet(doc, "A célpiacok listáját jogi review hagyja jóvá.")

    h2(doc, "5. Összeférhetetlenség kezelése")
    bullet(doc, "Az FX·King a rebate-et a tényleges, broker által visszaigazolt volumen alapján számolja.")
    bullet(doc, "A jutalom-mechanizmus nem ösztönöz a felhasználó érdekével ellentétes túlkereskedésre.")

    footer_disclaimer(doc)
    return doc

# ── build all ──
os.makedirs("docs/legal", exist_ok=True)
outputs = {
    "docs/legal/01-ASZF-TC.docx": build_tc,
    "docs/legal/02-Adatvedelem-GDPR.docx": build_gdpr,
    "docs/legal/03-Kockazati-Tajekoztato.docx": build_risk,
    "docs/legal/04-Affiliate-Disclosure.docx": build_affiliate,
}
for path, fn in outputs.items():
    fn().save(path)
    print("WROTE", path)
print("Done —", len(outputs), "legal stub docx files.")
