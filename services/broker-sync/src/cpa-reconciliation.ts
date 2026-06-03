import { PrismaClient } from "@fxking/db";
import { COMPLIANCE } from "@fxking/shared";

const prisma = new PrismaClient();

export async function confirmCpaEvents(): Promise<void> {
  // Find accounts with FTD but no confirmed CPA event
  const accounts = await prisma.account.findMany({
    where: { ftdAt: { not: null }, verified: true, cpaEvents: { none: {} } },
  });

  for (const account of accounts) {
    const confirmed = await verifyFtdWithBroker(account.login);
    if (!confirmed) continue;

    await prisma.$transaction(async (tx) => {
      const cpaEvent = await tx.cpaEvent.create({
        data: {
          accountId: account.id,
          amount: COMPLIANCE.CPA_AMOUNT_USD,
          confirmedAt: new Date(),
        },
      });

      // Release welcome cash (megemelt első havi rebate keretezés)
      const user = await tx.user.findUnique({ where: { id: account.userId } });
      if (!user) return;

      // Get current reward balance
      const lastEntry = await tx.walletEntry.findFirst({
        where: { userId: user.id, type: "REWARD" },
        orderBy: { createdAt: "desc" },
      });
      const currentBalance = Number(lastEntry?.balance ?? 0);

      await tx.walletEntry.create({
        data: {
          userId: user.id,
          type: "REWARD",
          op: "CREDIT",
          amount: COMPLIANCE.CPA_DISTRIBUTION.WELCOME_CASH_USD,
          balance: currentBalance + COMPLIANCE.CPA_DISTRIBUTION.WELCOME_CASH_USD,
          note: `Welcome reward — CPA event ${cpaEvent.id}`,
        },
      });

      // Release referral reward if applicable
      const referral = await tx.referral.findUnique({ where: { inviteeId: user.id } });
      if (referral && !referral.qualifiedAt) {
        await tx.referral.update({
          where: { inviteeId: user.id },
          data: {
            qualifiedAt: new Date(),
            reward: COMPLIANCE.CPA_DISTRIBUTION.REFERRAL_CASH_USD,
          },
        });

        const inviterLastEntry = await tx.walletEntry.findFirst({
          where: { userId: referral.inviterId, type: "REWARD" },
          orderBy: { createdAt: "desc" },
        });
        const inviterBalance = Number(inviterLastEntry?.balance ?? 0);

        await tx.walletEntry.create({
          data: {
            userId: referral.inviterId,
            type: "REWARD",
            op: "CREDIT",
            amount: COMPLIANCE.CPA_DISTRIBUTION.REFERRAL_CASH_USD,
            balance: inviterBalance + COMPLIANCE.CPA_DISTRIBUTION.REFERRAL_CASH_USD,
            note: `Referral reward — invitee ${user.id}`,
          },
        });
      }
    });
  }
}

async function clawbackCpaEvent(cpaEventId: string, reason: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const cpaEvent = await tx.cpaEvent.findUnique({
      where: { id: cpaEventId },
      include: { account: { include: { user: true } } },
    });
    if (!cpaEvent) return;

    // Clawback welcome reward — append reversal to ledger
    const lastEntry = await tx.walletEntry.findFirst({
      where: { userId: cpaEvent.account.userId, type: "REWARD" },
      orderBy: { createdAt: "desc" },
    });
    const currentBalance = Number(lastEntry?.balance ?? 0);
    const clawbackAmount = COMPLIANCE.CPA_DISTRIBUTION.WELCOME_CASH_USD;

    if (currentBalance >= clawbackAmount) {
      await tx.walletEntry.create({
        data: {
          userId: cpaEvent.account.userId,
          type: "REWARD",
          op: "DEBIT",
          amount: clawbackAmount,
          balance: currentBalance - clawbackAmount,
          note: `Clawback — CPA revoked: ${reason}`,
        },
      });
    }

    // Also clawback any referral rewards issued for this event
    // (implementation continues in prod version)
  });
}

async function verifyFtdWithBroker(ibLogin: string): Promise<boolean> {
  // Stub: in production, call IB API to verify FTD + qualifying volume
  // Returns true only when broker confirms
  return false;
}
