import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@fxking/db";

const prisma = new PrismaClient();

export async function referralRoutes(app: FastifyInstance) {
  app.get("/", async (req) => {
    const tgUser = (req as any).telegramUser;
    const user = await prisma.user.findUnique({
      where: { tgId: String(tgUser.id) },
      include: {
        referralsMade: {
          include: { invitee: { select: { tgUsername: true, createdAt: true } } },
        },
      },
    });
    if (!user) return { ok: false, error: "User not found" };

    const qualified = user.referralsMade.filter((r) => r.qualifiedAt !== null);
    const pending = user.referralsMade.filter((r) => r.qualifiedAt === null);

    return {
      ok: true,
      data: {
        referralCode: user.referralCode,
        totalInvited: user.referralsMade.length,
        qualifiedCount: qualified.length,
        pendingCount: pending.length,
        totalEarnedUsd: qualified.reduce((a, r) => a + Number(r.reward ?? 0), 0),
        referrals: user.referralsMade.map((r) => ({
          inviteeUsername: r.invitee.tgUsername,
          qualifiedAt: r.qualifiedAt,
          reward: Number(r.reward ?? 0),
          clawedBack: r.clawedBack,
          joinedAt: r.invitee.createdAt,
        })),
      },
    };
  });

  // Validate a referral code (public endpoint, no auth needed)
  app.get("/validate/:code", async (req, reply) => {
    const code = (req.params as any).code as string;
    const user = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true, tgUsername: true },
    });
    if (!user) return reply.code(404).send({ ok: false, error: "Invalid referral code" });
    return { ok: true, data: { valid: true, referrerUsername: user.tgUsername } };
  });
}
