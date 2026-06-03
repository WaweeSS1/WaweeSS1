import { PrismaClient } from "@rebound/db";

const prisma = new PrismaClient();

/**
 * OCR fallback adapter.
 *
 * For users whose broker offers neither an IB API nor an investor (read-only)
 * password, they can upload a trade-statement screenshot or PDF. We OCR it via
 * a gateway (wrapping e.g. Google Vision / Tesseract) and parse the trade rows.
 *
 * COMPLIANCE / ANTI-FARM: OCR is a LOW-TRUST source — statements can be forged.
 * Therefore OCR-ingested trades are recorded but every ingestion raises a
 * MANUAL_FLAG fraud flag, and rewards (welcome/referral) are NEVER auto-released
 * from OCR data. Only an admin (or a later broker-confirmed link) can promote
 * them. Cash rebate on OCR volume likewise stays PENDING until reviewed.
 */

interface ParsedTrade {
  ticket: string;
  symbol: string;
  side: "BUY" | "SELL";
  lots: number;
  pnl: number;
  openedAt: Date;
  closedAt: Date | null;
}

interface OcrIngestResult {
  parsed: number;
  inserted: number;
  flaggedForReview: true; // always — OCR is low-trust
}

/** Call the OCR gateway and return the raw recognised text. */
async function ocrExtractText(source: { url?: string; base64?: string }): Promise<string> {
  const baseUrl = process.env.OCR_GATEWAY_URL;
  const apiKey = process.env.OCR_GATEWAY_KEY;
  if (!baseUrl || !apiKey) throw new Error("OCR gateway not configured");

  const res = await fetch(`${baseUrl}/v1/extract`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(source),
  });
  if (!res.ok) throw new Error(`OCR gateway error: ${res.status}`);
  const { text } = (await res.json()) as { text: string };
  return text;
}

/**
 * Heuristic parser for MT4/MT5 "Closed Transactions" statement rows, e.g.:
 *   12345678  2024.05.01 09:30:12  buy  0.50  EURUSD  1.0850 ... 1.0900  +25.00
 * Tolerant to whitespace/locale variations. Anything ambiguous is skipped
 * (better to under-count than to credit a forged row).
 */
export function parseStatementText(text: string): ParsedTrade[] {
  const out: ParsedTrade[] = [];
  const row =
    /(\d{6,})\s+(\d{4}[.\-/]\d{2}[.\-/]\d{2}\s+\d{2}:\d{2}(?::\d{2})?)\s+(buy|sell)\s+([\d.,]+)\s+([A-Z]{6,}|[A-Z]{3}\/[A-Z]{3})/i;

  for (const raw of text.split(/\r?\n/)) {
    const m = raw.match(row);
    if (!m) continue;

    const lots = parseFloat(m[4].replace(",", "."));
    if (!Number.isFinite(lots) || lots <= 0) continue;

    // P&L is the last signed number on the line, if present.
    const pnlMatch = raw.match(/(-?\d[\d\s]*[.,]\d{2})\s*$/);
    const pnl = pnlMatch ? parseFloat(pnlMatch[1].replace(/\s/g, "").replace(",", ".")) : 0;

    out.push({
      ticket: m[1],
      symbol: m[5].replace("/", "").toUpperCase(),
      side: m[3].toUpperCase() === "BUY" ? "BUY" : "SELL",
      lots,
      pnl,
      openedAt: new Date(m[2].replace(/\./g, "-").replace(" ", "T")),
      closedAt: null, // statement close time is not reliably positioned; left null
    });
  }
  return out;
}

/**
 * Full ingestion: OCR → parse → persist trades (low-trust) → raise manual-review flag.
 * Rewards are NOT released here.
 */
export async function ingestStatement(
  accountId: string,
  userId: string,
  source: { url?: string; base64?: string },
): Promise<OcrIngestResult> {
  const text = await ocrExtractText(source);
  const trades = parseStatementText(text);

  let inserted = 0;
  await prisma.$transaction(async (tx) => {
    for (const t of trades) {
      const id = `ocr_${accountId}_${t.ticket}`;
      // createMany-style guard: skip if already present (idempotent re-uploads)
      const exists = await tx.trade.findUnique({ where: { id } });
      if (exists) continue;
      await tx.trade.create({
        data: {
          id,
          accountId,
          pair: t.symbol,
          side: t.side,
          lots: t.lots,
          pnl: t.pnl,
          openedAt: t.openedAt,
          closedAt: t.closedAt,
        },
      });
      inserted++;
    }

    // Always flag OCR ingestion for human review before any reward release.
    await tx.fraudFlag.create({
      data: {
        userId,
        signal: "MANUAL_FLAG",
        detail: {
          source: "OCR_FALLBACK",
          accountId,
          parsedTrades: trades.length,
          insertedTrades: inserted,
          reason: "OCR statement upload — verify authenticity before reward release",
        },
      },
    });
  });

  return { parsed: trades.length, inserted, flaggedForReview: true };
}
