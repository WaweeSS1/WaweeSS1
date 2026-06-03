import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@fxking/db";

const prisma = new PrismaClient();

export async function walletRoutes(app: FastifyInstance) {
  // GET /v1/wallet — aktuális egyenleg
  app.get("/", async (req) => {
    const tgUser = (req as any).telegramUser;
    const user = await prisma.user.findUnique({ where: { tgId: String(tgUser.id) } });
    if (!user) return { ok: false, error: "User not found" };

    const entries = await prisma.walletEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    // Balance from last ledger entry per type
    const rebateEntry = await prisma.walletEntry.findFirst({
      where: { userId: user.id, type: "REBATE" },
      orderBy: { createdAt: "desc" },
    });
    const rewardEntry = await prisma.walletEntry.findFirst({
      where: { userId: user.id, type: "REWARD" },
      orderBy: { createdAt: "desc" },
    });

    return {
      ok: true,
      data: {
        rebateBalance: Number(rebateEntry?.balance ?? 0),
        rewardBalance: Number(rewardEntry?.balance ?? 0),
        totalPayable: Number((rebateEntry?.balance ?? 0)) + Number((rewardEntry?.balance ?? 0)),
        currency: "USD" as const,
        isPayable: true, // cash — soha nem trade-locked
      },
    };
  });

  // GET /v1/wallet/history — ledger history
  app.get("/history", async (req) => {
    const tgUser = (req as any).telegramUser;
    const user = await prisma.user.findUnique({ where: { tgId: String(tgUser.id) } });
    if (!user) return { ok: false, error: "User not found" };

    const entries = await prisma.walletEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { ok: true, data: entries };
  });
}
