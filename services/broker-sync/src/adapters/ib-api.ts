import { PrismaClient } from "@rebound/db";

const prisma = new PrismaClient();

export async function syncIbTrades(accountId: string, ibLogin: string): Promise<void> {
  const baseUrl = process.env.IB_API_BASE_URL;
  const apiKey = process.env.IB_API_KEY;
  if (!baseUrl || !apiKey) throw new Error("IB API not configured");

  // Fetch recent trades from IB REST API
  // NOTE: exact endpoint / auth scheme must be confirmed from IB API docs
  const res = await fetch(`${baseUrl}/v1/accounts/${ibLogin}/trades`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new Error(`IB API error: ${res.status}`);
  const { trades } = await res.json() as { trades: IbTrade[] };

  for (const t of trades) {
    await prisma.trade.upsert({
      where: { id: `ib_${t.tradeId}` },
      update: { pnl: t.realizedPnl, closedAt: t.closeTime ? new Date(t.closeTime) : undefined },
      create: {
        id: `ib_${t.tradeId}`,
        accountId,
        pair: t.symbol,
        side: t.side,
        lots: t.quantity / 100000, // convert units to lots
        pnl: t.realizedPnl,
        openedAt: new Date(t.openTime),
        closedAt: t.closeTime ? new Date(t.closeTime) : undefined,
      },
    });
  }
}

interface IbTrade {
  tradeId: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  realizedPnl: number;
  openTime: string;
  closeTime?: string;
}
