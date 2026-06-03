#!/usr/bin/env python3
"""
Rebound economics model generator.

Builds docs/economics.xlsx — a fully tunable financial model.
Change any cell on the "Bemenetek" (Inputs) sheet and every downstream
sheet recalculates via live formulas. Numbers are seeded from the
NON-NEGOTIABLE compliance constants (packages/shared/src/compliance.ts).

Run:  python3 scripts/build_economics_xlsx.py
"""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, NamedStyle
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.comments import Comment

# ── Thermal Instrument palette ─────────────────────────────────────────────
SLATE   = "0D1117"   # deep slate background
SURFACE = "161B22"   # panel surface
INK     = "C9D1D9"   # primary text
INK2    = "8B949E"   # secondary text
AMBER   = "D4920A"   # thermal amber — data accent ONLY
GREEN   = "2EA043"   # positive
RED     = "DA3633"   # negative
BORDER  = "30363D"

thin = Side(style="thin", color=BORDER)
box  = Border(left=thin, right=thin, top=thin, bottom=thin)

def fill(hex_): return PatternFill("solid", fgColor=hex_)

H1 = Font(name="Consolas", size=16, bold=True, color=AMBER)
H2 = Font(name="Consolas", size=11, bold=True, color=INK)
LBL = Font(name="Calibri", size=10, color=INK)
LBL2 = Font(name="Calibri", size=9, color=INK2, italic=True)
VAL = Font(name="Consolas", size=11, color=INK)
VAL_AMBER = Font(name="Consolas", size=11, bold=True, color=AMBER)
INPUT_FONT = Font(name="Consolas", size=11, bold=True, color="0D1117")

wb = Workbook()

def style_header(ws, title, subtitle):
    ws.sheet_view.showGridLines = False
    ws["A1"] = title
    ws["A1"].font = H1
    ws["A2"] = subtitle
    ws["A2"].font = LBL2
    for r in (1, 2):
        for c in range(1, 12):
            ws.cell(row=r, column=c).fill = fill(SLATE)

def cell(ws, ref, value, font=VAL, fillhex=SURFACE, border=True, align="left", numfmt=None):
    c = ws[ref]
    c.value = value
    c.font = font
    c.fill = fill(fillhex)
    if border: c.border = box
    c.alignment = Alignment(horizontal=align, vertical="center")
    if numfmt: c.number_format = numfmt
    return c

# ════════════════════════════════════════════════════════════════════════════
# SHEET 1 — BEMENETEK (INPUTS)  — every value here is tunable
# ════════════════════════════════════════════════════════════════════════════
ws = wb.active
ws.title = "Bemenetek"
style_header(ws, "REBOUND — GAZDASÁGI MODELL", "Hangolható bemenetek · módosíts bármit, a többi lap újraszámol · forrás: compliance.ts")
ws.column_dimensions["A"].width = 42
ws.column_dimensions["B"].width = 16
ws.column_dimensions["C"].width = 50

inputs = [
    ("CPA / BROKER BEVÉTEL", None, None, None),
    ("CPA összeg (broker fizet / qualified FTD)", 600, "$", "Csak broker-megerősített FTD + qualifying volume után"),
    ("Welcome cash (megemelt 1. havi rebate)", 100, "$", "Cashback-keretezés, NEM 'fizess be kapsz X'"),
    ("Referral cash (csak qualified FTD után)", 80, "$", "Signup csak XP-t ad, készpénz csak FTD után"),
    ("OPEX / CPA", 40, "$", "Működési költség allokáció"),
    ("RevShare gross / lot", 2.40, "$", "Broker-nettó ~$8/lot 30%-a"),
    ("REBATE (CASHBACK — soha nem trade-locked)", None, None, None),
    ("Standard rebate / lot", 1.20, "$", "Mindig készpénz, kifizethető"),
    ("VIP rebate / lot", 1.60, "$", "VIP tier"),
    ("VIP felhasználók aránya", 0.20, "%", "0..1 között"),
    ("VISELKEDÉS / RETENCIÓ", None, None, None),
    ("Átlag lot / hó / aktív trader", 10, "lot", "Retained trader feltételezés"),
    ("Retenció (hónap)", 12, "hó", "LTV időhorizont"),
    ("Havi lemorzsolódás (churn)", 0.08, "%", "0..1 — havi kieső arány"),
    ("FTD konverzió (signup → qualified FTD)", 0.85, "%", "0..1"),
    ("AKVIZÍCIÓ", None, None, None),
    ("Új signup / hó", 100, "fő", "Cohort méret"),
    ("CAC (akvizíciós költség / signup)", 25, "$", "Marketing / fő"),
    ("Min. kifizetés", 20, "$", "PAYOUT_MIN_USD — compliance"),
]

r = 4
input_refs = {}
for label, value, unit, note in inputs:
    if value is None:  # section header
        for col in ("A", "B", "C"):
            ws[f"{col}{r}"].fill = fill(SLATE)
        c = cell(ws, f"A{r}", label, font=H2, fillhex=SLATE, border=False)
        ws.merge_cells(f"A{r}:C{r}")
    else:
        cell(ws, f"A{r}", label, font=LBL)
        nf = '#,##0.00' if isinstance(value, float) else '#,##0'
        if unit == "%": nf = '0%'
        bc = cell(ws, f"B{r}", value, font=INPUT_FONT, fillhex=AMBER, align="center", numfmt=nf)
        bc.comment = Comment(note, "Rebound") if note else None
        cell(ws, f"C{r}", note or "", font=LBL2)
        input_refs[label] = f"Bemenetek!B{r}"
    r += 1

# Derived: net margin / CPA
cell(ws, f"A{r}", "→ Nettó margin / CPA (számított)", font=LBL)
cell(ws, f"B{r}", f"={input_refs['CPA összeg (broker fizet / qualified FTD)']}-{input_refs['Welcome cash (megemelt 1. havi rebate)']}-{input_refs['Referral cash (csak qualified FTD után)']}-{input_refs['OPEX / CPA']}",
     font=VAL_AMBER, fillhex=SURFACE, align="center", numfmt='$#,##0')
cell(ws, f"C{r}", "CPA − welcome − referral − opex", font=LBL2)
NET_MARGIN_CPA = f"Bemenetek!B{r}"
r += 2

cell(ws, f"A{r}", "COMPLIANCE GATE", font=H2, fillhex=SLATE, border=False)
ws.merge_cells(f"A{r}:C{r}")
r += 1
for note in [
    "• Rebate mindig készpénz — SOHA nem trade-locked.",
    "• Jutalom CSAK broker-megerősített FTD + qualifying volume után.",
    "• Clawback aktív, ha a broker visszavonja a CPA-t.",
    "• Kockázati figyelmeztetés minden felületen. Tools, not tips.",
]:
    cell(ws, f"A{r}", note, font=LBL2, fillhex=SURFACE)
    ws.merge_cells(f"A{r}:C{r}")
    r += 1

# Convenience refs
CPA            = input_refs["CPA összeg (broker fizet / qualified FTD)"]
WELCOME        = input_refs["Welcome cash (megemelt 1. havi rebate)"]
REFERRAL       = input_refs["Referral cash (csak qualified FTD után)"]
REVSHARE_LOT   = input_refs["RevShare gross / lot"]
REBATE_STD     = input_refs["Standard rebate / lot"]
REBATE_VIP     = input_refs["VIP rebate / lot"]
VIP_SHARE      = input_refs["VIP felhasználók aránya"]
LOTS_MO        = input_refs["Átlag lot / hó / aktív trader"]
RETENTION_MO   = input_refs["Retenció (hónap)"]
CHURN          = input_refs["Havi lemorzsolódás (churn)"]
FTD_CONV       = input_refs["FTD konverzió (signup → qualified FTD)"]
SIGNUPS_MO     = input_refs["Új signup / hó"]
CAC            = input_refs["CAC (akvizíciós költség / signup)"]

# ════════════════════════════════════════════════════════════════════════════
# SHEET 2 — UNIT ECONOMICS
# ════════════════════════════════════════════════════════════════════════════
ws2 = wb.create_sheet("Unit Economics")
style_header(ws2, "UNIT ECONOMICS", "1 retained trader · élő képletek a Bemenetek lapról")
ws2.column_dimensions["A"].width = 46
ws2.column_dimensions["B"].width = 18
ws2.column_dimensions["C"].width = 46

rows = [
    ("Vegyes rebate / lot (std/VIP súlyozott)", f"={REBATE_STD}*(1-{VIP_SHARE})+{REBATE_VIP}*{VIP_SHARE}", '$#,##0.00', "Súlyozott a VIP arány szerint"),
    ("RevShare gross / hó", f"={LOTS_MO}*{REVSHARE_LOT}", '$#,##0.00', "lot/hó × RevShare/lot"),
    ("Rebate kifizetve / hó", f"={LOTS_MO}*( {REBATE_STD}*(1-{VIP_SHARE})+{REBATE_VIP}*{VIP_SHARE} )", '$#,##0.00', "Visszaosztott cashback"),
    ("Nettó RevShare margin / hó", "='Unit Economics'!B6-'Unit Economics'!B7", '$#,##0.00', "RevShare − rebate"),
    ("Nettó margin / hó × retenció", f"='Unit Economics'!B8*{RETENTION_MO}", '$#,##0.00', "Folyó margin a retenciós ablakban"),
    ("+ Nettó CPA margin (egyszeri)", f"={NET_MARGIN_CPA}", '$#,##0.00', "FTD-nél egyszer"),
    ("= Bruttó LTV / trader", "='Unit Economics'!B9+'Unit Economics'!B10", '$#,##0.00', "CPA margin + folyó margin"),
    ("− CAC", f"=-{CAC}", '$#,##0.00', "Akvizíciós költség"),
    ("= NETTÓ LTV / trader", "='Unit Economics'!B11+'Unit Economics'!B12", '$#,##0.00', "A kulcsmutató"),
    ("LTV / CAC arány", f"='Unit Economics'!B11/{CAC}", '0.0"x"', ">3x egészséges"),
    ("Megtérülés (hónap)", f"=IF('Unit Economics'!B8<=0,\"n/a\",{CAC}/'Unit Economics'!B8)", '0.0', "CAC / havi margin"),
]
r = 4
ws2[f"A{r}"] = "Mutató"; ws2[f"A{r}"].font = H2; ws2[f"A{r}"].fill = fill(SLATE)
ws2[f"B{r}"] = "Érték"; ws2[f"B{r}"].font = H2; ws2[f"B{r}"].fill = fill(SLATE); ws2[f"B{r}"].alignment = Alignment(horizontal="center")
ws2[f"C{r}"] = "Megjegyzés"; ws2[f"C{r}"].font = H2; ws2[f"C{r}"].fill = fill(SLATE)
r = 5
for label, formula, nf, note in rows:
    is_key = "NETTÓ LTV" in label
    cell(ws2, f"A{r}", label, font=(VAL_AMBER if is_key else LBL))
    cell(ws2, f"B{r}", formula, font=(VAL_AMBER if is_key else VAL), align="center", numfmt=nf,
         fillhex=(SLATE if is_key else SURFACE))
    cell(ws2, f"C{r}", note, font=LBL2)
    r += 1

# ════════════════════════════════════════════════════════════════════════════
# SHEET 3 — COHORT / LTV (12 hónapos projekció)
# ════════════════════════════════════════════════════════════════════════════
ws3 = wb.create_sheet("Cohort & LTV")
style_header(ws3, "COHORT / LTV PROJEKCIÓ", "1 havi signup-cohort 12 hónapon át · churn-nel diszkontálva")
headers = ["Hónap", "Aktív traderek", "Lot / hó", "RevShare gross", "Rebate kif.", "Nettó margin", "Kumulált nettó"]
widths = [10, 16, 12, 16, 14, 16, 18]
for i, (h, w) in enumerate(zip(headers, widths), start=1):
    col = get_column_letter(i)
    ws3.column_dimensions[col].width = w
    c = cell(ws3, f"{col}4", h, font=H2, fillhex=SLATE, align="center")

# Month 1: signups * FTD conversion become active; CPA margin recognized month 1
start = 5
for m in range(12):
    row = start + m
    if m == 0:
        active = f"={SIGNUPS_MO}*{FTD_CONV}"
        cum_prev = 0
    else:
        active = f"=B{row-1}*(1-{CHURN})"
    cell(ws3, f"A{row}", m+1, font=VAL, align="center")
    cell(ws3, f"B{row}", active, font=VAL, align="center", numfmt='#,##0.0')
    cell(ws3, f"C{row}", f"=B{row}*{LOTS_MO}", font=VAL, align="center", numfmt='#,##0')
    cell(ws3, f"D{row}", f"=C{row}*{REVSHARE_LOT}", font=VAL, align="center", numfmt='$#,##0')
    cell(ws3, f"E{row}", f"=C{row}*( {REBATE_STD}*(1-{VIP_SHARE})+{REBATE_VIP}*{VIP_SHARE} )", font=VAL, align="center", numfmt='$#,##0')
    # net margin: RevShare-rebate, plus one-time CPA net margin in month 1
    if m == 0:
        cell(ws3, f"F{row}", f"=D{row}-E{row}+B{row}*{NET_MARGIN_CPA}", font=VAL_AMBER, align="center", numfmt='$#,##0')
        cell(ws3, f"G{row}", f"=F{row}-B{row}*{CAC}", font=VAL, align="center", numfmt='$#,##0')
    else:
        cell(ws3, f"F{row}", f"=D{row}-E{row}", font=VAL, align="center", numfmt='$#,##0')
        cell(ws3, f"G{row}", f"=G{row-1}+F{row}", font=VAL, align="center", numfmt='$#,##0')

total_row = start + 12
cell(ws3, f"A{total_row}", "Σ 12 hó", font=H2, fillhex=SLATE, align="center")
cell(ws3, f"B{total_row}", "", fillhex=SLATE)
cell(ws3, f"C{total_row}", f"=SUM(C{start}:C{total_row-1})", font=VAL_AMBER, fillhex=SLATE, align="center", numfmt='#,##0')
cell(ws3, f"D{total_row}", f"=SUM(D{start}:D{total_row-1})", font=VAL_AMBER, fillhex=SLATE, align="center", numfmt='$#,##0')
cell(ws3, f"E{total_row}", f"=SUM(E{start}:E{total_row-1})", font=VAL_AMBER, fillhex=SLATE, align="center", numfmt='$#,##0')
cell(ws3, f"F{total_row}", f"=SUM(F{start}:F{total_row-1})", font=VAL_AMBER, fillhex=SLATE, align="center", numfmt='$#,##0')
cell(ws3, f"G{total_row}", f"=G{total_row-1}", font=VAL_AMBER, fillhex=SLATE, align="center", numfmt='$#,##0')

# ════════════════════════════════════════════════════════════════════════════
# SHEET 4 — BREAK-EVEN & SENSITIVITY
# ════════════════════════════════════════════════════════════════════════════
ws4 = wb.create_sheet("Break-even")
style_header(ws4, "BREAK-EVEN & ÉRZÉKENYSÉG", "Mikor termel vissza egy felhasználó · lot-érzékenység")
ws4.column_dimensions["A"].width = 44
ws4.column_dimensions["B"].width = 18
ws4.column_dimensions["C"].width = 44

be_rows = [
    ("Nettó margin / lot (RevShare − rebate)", f"={REVSHARE_LOT}-( {REBATE_STD}*(1-{VIP_SHARE})+{REBATE_VIP}*{VIP_SHARE} )", '$#,##0.00', "Folyó hozzájárulás lotonként"),
    ("Akvizíciós + welcome + referral teher / FTD", f"={CAC}+{WELCOME}+{REFERRAL}", '$#,##0.00', "Amit vissza kell termelni"),
    ("CPA fedezet / FTD", f"={CPA}", '$#,##0.00', "Broker fizeti FTD-nél"),
    ("Nettó kezdő pozíció / FTD", f"={CPA}-({CAC}+{WELCOME}+{REFERRAL})", '$#,##0.00', "CPA − terhek (>0 = azonnal nyereséges)"),
    ("Break-even lot (ha nettó kezdő < 0)", f"=IF('Break-even'!B8>=0,0,-'Break-even'!B8/'Break-even'!B5)", '#,##0.0', "Hány lot kell a nullszaldóhoz"),
    ("Break-even invitáció / CPA", f"=({CAC}+{WELCOME}+{REFERRAL})/{NET_MARGIN_CPA}", '#,##0.0', "Hány invite termeli vissza a terhet"),
]
r = 4
ws4[f"A{r}"] = "Mutató"; ws4[f"A{r}"].font = H2; ws4[f"A{r}"].fill = fill(SLATE)
ws4[f"B{r}"] = "Érték"; ws4[f"B{r}"].font = H2; ws4[f"B{r}"].fill = fill(SLATE); ws4[f"B{r}"].alignment = Alignment(horizontal="center")
ws4[f"C{r}"] = "Megjegyzés"; ws4[f"C{r}"].font = H2; ws4[f"C{r}"].fill = fill(SLATE)
r = 5
for label, formula, nf, note in be_rows:
    cell(ws4, f"A{r}", label, font=LBL)
    cell(ws4, f"B{r}", formula, font=VAL_AMBER, align="center", numfmt=nf)
    cell(ws4, f"C{r}", note, font=LBL2)
    r += 1

# Sensitivity table: net 12-mo margin per trader vs lots/month
r += 2
cell(ws4, f"A{r}", "ÉRZÉKENYSÉG — nettó 12 hó margin / trader vs. lot/hó", font=H2, fillhex=SLATE, border=False)
ws4.merge_cells(f"A{r}:C{r}")
r += 1
cell(ws4, f"A{r}", "lot / hó", font=H2, fillhex=SLATE, align="center")
cell(ws4, f"B{r}", "nettó 12 hó margin", font=H2, fillhex=SLATE, align="center")
cell(ws4, f"C{r}", "megjegyzés", font=H2, fillhex=SLATE)
r += 1
for lots in [2, 5, 10, 15, 25, 50]:
    # net margin/lot * lots * 12 + CPA net margin - CAC - welcome - referral
    f = f"={lots}*('Break-even'!B5)*12+{NET_MARGIN_CPA}-{CAC}"
    cell(ws4, f"A{r}", lots, font=VAL, align="center")
    cell(ws4, f"B{r}", f, font=VAL_AMBER, align="center", numfmt='$#,##0')
    note = "low-volume" if lots <= 5 else ("base case" if lots == 10 else "high-volume")
    cell(ws4, f"C{r}", note, font=LBL2)
    r += 1

# ════════════════════════════════════════════════════════════════════════════
# SHEET 5 — README / GUARDRAILS
# ════════════════════════════════════════════════════════════════════════════
ws5 = wb.create_sheet("Olvass el")
style_header(ws5, "HASZNÁLAT & COMPLIANCE", "Hogyan hangold a modellt — és mit NEM szabad")
ws5.column_dimensions["A"].width = 100
notes = [
    ("", ""),
    ("HASZNÁLAT", H2),
    ("1. Csak a 'Bemenetek' lap sárga celláit módosítsd. Minden más képlet, automatikusan frissül.", LBL),
    ("2. A 'Unit Economics' egyetlen retained trader gazdaságtanát mutatja.", LBL),
    ("3. A 'Cohort & LTV' egy havi signup-csoportot vetít előre 12 hónapra, churn-nel.", LBL),
    ("4. A 'Break-even' megmutatja, mennyi lot / invite kell a megtérüléshez + lot-érzékenység.", LBL),
    ("", ""),
    ("FELTÉTELEZÉSEK", H2),
    ("• A RevShare gross/lot a broker-nettó ~30%-a (~$8 nettó → $2.40). Valós riportból írd felül.", LBL2),
    ("• A retenció egyszerűsített: konstans havi churn. Valós cohort-adat pontosabb.", LBL2),
    ("• A CPA nettó margin egyszeri, az FTD hónapjában realizálódik.", LBL2),
    ("", ""),
    ("NON-NEGOTIABLE COMPLIANCE", H2),
    ("• A rebate KÉSZPÉNZ — soha nem trade-locked. A modell sem feltételez trade-lockot.", VAL_AMBER),
    ("• Jutalom CSAK broker-megerősített FTD + qualifying volume után (FTD konverzió input).", VAL_AMBER),
    ("• Clawback: ha a broker visszavonja a CPA-t, a nettó margin és a kifizetett jutalom visszaíródik.", VAL_AMBER),
    ("• Ez NEM befektetési modell ügyfeleknek — belső pénzügyi tervezés. Tools, not tips.", VAL_AMBER),
    ("", ""),
    ("Forrás: packages/shared/src/compliance.ts — a konstansok módosítása jogi review-t igényel.", LBL2),
]
r = 4
for text, font in notes:
    c = ws5[f"A{r}"]
    c.value = text
    c.font = font if isinstance(font, Font) else LBL
    c.fill = fill(SLATE if font is H2 else SURFACE if text else SLATE)
    c.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    r += 1

# set tab colors
for s in wb.worksheets:
    s.sheet_properties.tabColor = AMBER

import os
# Force Excel/LibreOffice to recalculate all formulas on open (so cached
# values are never stale after an input change).
from openpyxl.workbook.properties import CalcProperties
wb.calculation = CalcProperties(fullCalcOnLoad=True)

os.makedirs("docs", exist_ok=True)
wb.save("docs/economics.xlsx")
print("WROTE docs/economics.xlsx with", len(wb.worksheets), "sheets:", [s.title for s in wb.worksheets])
