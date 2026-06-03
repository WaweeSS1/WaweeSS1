import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@fxking/db";

const prisma = new PrismaClient();

export async function rebateRoutes(app: FastifyInstance) {
  app.get("/summary", async (req) => {
    const tgUser = (req as any).telegramUser;
    const user = await prisma.user.findUnique({
      where: { tgId: String(tgUser.id) },
      include: { accounts: { include: { trades: { include: { rebates: true } } } } },
    });
    if (!user) return { ok: false, error: "User not found" };

    const allRebates = user.accounts.flatMap((a) => a.trades.flatMap((t) => t.rebates));

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const summary = {
      pendingUsd: sum(allRebates.filter((r) => r.status === "PENDING").map((r) => Number(r.amount))),
      confirmedUsd: sum(allRebates.filter((r) => r.status === "CONFIRMED").map((r) => Number(r.amount))),
      clawedBackUsd: sum(allRebates.filter((r) => r.status === "CLAWED_BACK").map((r) => Number(r.amount))),
      currentMonthUsd: sum(
        allRebates
          .filter((r) => r.createdAt >= startOfMonth && r.status !== "CLAWED_BACK")
          .map((r) => Number(r.amount))
      ),
    };

    return { ok: true, data: summary };
  });
}

function sum(nums: number[]): number {
  return Math.round(nums.reduce((a, b) => a + b, 0) * 100) / 100;
}
