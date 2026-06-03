import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@rebound/db";

const prisma = new PrismaClient();

type Period = "7d" | "30d" | "90d" | "all";

export async function tradeRoutes(app: FastifyInstance) {
  app.get("/stats", async (req) => {
    const tgUser = (req as any).telegramUser;
    const period = ((req.query as any).period ?? "30d") as Period;

    const user = await prisma.user.findUnique({ where: { tgId: String(tgUser.id) } });
    if (!user) return { ok: false, error: "User not found" };

    const since = periodToDate(period);
    const trades = await prisma.trade.findMany({
      where: {
        account: { userId: user.id },
        closedAt: since ? { gte: since } : undefined,
      },
      orderBy: { openedAt: "asc" },
    });

    const winCount = trades.filter((t) => Number(t.pnl) > 0).length;
    const winRate = trades.length > 0 ? winCount / trades.length : 0;

    // Simple drawdown calculation
    let peak = 0;
    let equity = 0;
    let maxDrawdown = 0;
    for (const t of trades) {
      equity += Number(t.pnl);
      if (equity > peak) peak = equity;
      const dd = peak > 0 ? (peak - equity) / peak : 0;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    // Revenge trading: loss followed immediately by trade > 2x avg size
    const avgLots = trades.length > 0 ? trades.reduce((a, t) => a + Number(t.lots), 0) / trades.length : 0;
    let revengeCount = 0;
    for (let i = 1; i < trades.length; i++) {
      if (Number(trades[i - 1].pnl) < 0 && Number(trades[i].lots) > avgLots * 2) {
        revengeCount++;
      }
    }

    return {
      ok: true,
      data: {
        totalLots: trades.reduce((a, t) => a + Number(t.lots), 0),
        winRate: Math.round(winRate * 1000) / 10,
        maxDrawdown: Math.round(maxDrawdown * 1000) / 10,
        revengeTradeCount: revengeCount,
        tradeCount: trades.length,
        period,
      },
    };
  });
}

function periodToDate(period: Period): Date | null {
  if (period === "all") return null;
  const days = { "7d": 7, "30d": 30, "90d": 90 }[period];
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}
