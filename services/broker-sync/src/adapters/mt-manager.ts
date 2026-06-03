import { PrismaClient } from "@fxking/db";

const prisma = new PrismaClient();

/**
 * MT4 / MT5 Manager-API adapter.
 *
 * The native MT4/MT5 Manager API is a Windows C++ SDK, so production deploys
 * it behind a thin gateway microservice (e.g. a containerised bridge or a
 * hosted provider such as MetaApi) that exposes closed deals over HTTPS.
 * This adapter talks to that gateway.
 *
 * COMPLIANCE: only INVESTOR (read-only) access is used. We never hold trading
 * credentials capable of placing orders — the link type is INVESTOR_PASSWORD.
 */

export type MtPlatform = "MT4" | "MT5";

interface MtDeal {
  ticket: number;        // deal / order ticket
  symbol: string;        // e.g. "EURUSD"
  cmd: number;           // MT4: 0=BUY 1=SELL · MT5 deal type normalised by gateway
  volume: number;        // MT4: lots*100 (100 = 1.00 lot) · MT5: gateway-normalised
  profit: number;        // realised P&L in account currency
  openTime: string;      // ISO 8601
  closeTime?: string;    // ISO 8601 (absent = still open)
  contractSize?: number; // optional override for non-standard symbols
}

interface MtSyncResult {
  fetched: number;
  upserted: number;
  platform: MtPlatform;
}

/** MT4 reports volume in lots*100. MT5 gateways are configured to normalise
 *  to the same unit, so a single divisor keeps the conversion in one place. */
const MT_VOLUME_DIVISOR = 100;

function mtSideFromCmd(cmd: number): "BUY" | "SELL" {
  // MT4 cmd: 0=OP_BUY, 1=OP_SELL. MT5 deal types are mapped to 0/1 by the gateway.
  return cmd === 0 ? "BUY" : "SELL";
}

/**
 * Sync closed deals for one account from the MT Manager gateway.
 * `login` is the investor/read-only login on the MT server.
 */
export async function syncMtTrades(
  accountId: string,
  login: string,
  platform: MtPlatform,
  sinceIso?: string,
): Promise<MtSyncResult> {
  const baseUrl = process.env.MT_GATEWAY_URL;
  const apiKey = process.env.MT_GATEWAY_KEY;
  if (!baseUrl || !apiKey) throw new Error("MT Manager gateway not configured");

  // Only request CLOSED deals since the last sync (incremental). The gateway
  // enforces read-only investor scope; we additionally pass access=investor.
  const url = new URL(`${baseUrl}/v1/${platform.toLowerCase()}/${login}/deals`);
  url.searchParams.set("access", "investor");
  url.searchParams.set("state", "closed");
  if (sinceIso) url.searchParams.set("since", sinceIso);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`MT gateway error (${platform}): ${res.status}`);

  const { deals } = (await res.json()) as { deals: MtDeal[] };
  let upserted = 0;

  for (const d of deals) {
    // Skip non-trade entries (balance ops, credits) that some servers include.
    if (!d.symbol || d.volume <= 0) continue;

    const lots = d.volume / MT_VOLUME_DIVISOR;
    const id = `${platform.toLowerCase()}_${login}_${d.ticket}`;

    await prisma.trade.upsert({
      where: { id },
      update: {
        pnl: d.profit,
        closedAt: d.closeTime ? new Date(d.closeTime) : null,
      },
      create: {
        id,
        accountId,
        pair: d.symbol,
        side: mtSideFromCmd(d.cmd),
        lots,
        pnl: d.profit,
        openedAt: new Date(d.openTime),
        closedAt: d.closeTime ? new Date(d.closeTime) : null,
      },
    });
    upserted++;
  }

  return { fetched: deals.length, upserted, platform };
}

/**
 * Verify FTD + qualifying volume directly from the MT server (read-only).
 * Used by CPA reconciliation. Returns true ONLY when the broker-side data
 * confirms a funded first deposit and the qualifying traded volume — rewards
 * are never released on app-side assumptions.
 */
export async function verifyMtFtd(
  login: string,
  platform: MtPlatform,
  minQualifyingLots: number,
): Promise<boolean> {
  const baseUrl = process.env.MT_GATEWAY_URL;
  const apiKey = process.env.MT_GATEWAY_KEY;
  if (!baseUrl || !apiKey) return false;

  const res = await fetch(
    `${baseUrl}/v1/${platform.toLowerCase()}/${login}/account-summary?access=investor`,
    { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" } },
  );
  if (!res.ok) return false;

  const s = (await res.json()) as {
    firstDepositConfirmed: boolean;
    totalDeposits: number;
    closedVolumeLots: number;
  };

  return s.firstDepositConfirmed && s.totalDeposits > 0 && s.closedVolumeLots >= minQualifyingLots;
}
