import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@rebound/db";
import { z } from "zod";
import { COMPLIANCE } from "@rebound/shared";

const prisma = new PrismaClient();

const requestPayoutSchema = z.object({
  amount: z.number().min(COMPLIANCE.PAYOUT_MIN_USD, `Minimum payout is $${COMPLIANCE.PAYOUT_MIN_USD}`),
  method: z.enum(["USDC_BEP20", "BANK_TRANSFER"]),
  walletAddress: z.string().optional(),
  bankDetails: z.object({
    iban: z.string(),
    accountHolder: z.string(),
  }).optional(),
});

export async function payoutRoutes(app: FastifyInstance) {
  app.post("/request", async (req, reply) => {
    const tgUser = (req as any).telegramUser;
    const body = requestPayoutSchema.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ ok: false, error: body.error.message });

    const user = await prisma.user.findUnique({ where: { tgId: String(tgUser.id) } });
    if (!user) return reply.code(404).send({ ok: false, error: "User not found" });

    // Check balance
    const rebateEntry = await prisma.walletEntry.findFirst({
      where: { userId: user.id, type: "REBATE" },
      orderBy: { createdAt: "desc" },
    });
    const rewardEntry = await prisma.walletEntry.findFirst({
      where: { userId: user.id, type: "REWARD" },
      orderBy: { createdAt: "desc" },
    });

    const available = Number(rebateEntry?.balance ?? 0) + Number(rewardEntry?.balance ?? 0);
    if (body.data.amount > available) {
      return reply.code(400).send({ ok: false, error: "Insufficient balance" });
    }

    const payout = await prisma.payout.create({
      data: {
        userId: user.id,
        amount: body.data.amount,
        method: body.data.method,
        status: "PENDING",
      },
    });

    return { ok: true, data: { payoutId: payout.id, status: "PENDING" } };
  });

  app.get("/history", async (req) => {
    const tgUser = (req as any).telegramUser;
    const user = await prisma.user.findUnique({ where: { tgId: String(tgUser.id) } });
    if (!user) return { ok: false, error: "User not found" };

    const payouts = await prisma.payout.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return { ok: true, data: payouts };
  });
}
