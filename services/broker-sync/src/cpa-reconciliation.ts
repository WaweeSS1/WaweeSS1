import { PrismaClient } from "@rebound/db";
import { COMPLIANCE } from "@rebound/shared";
import { verifyMtFtd, type MtPlatform } from "./adapters/mt-manager";

const prisma = new PrismaClient();

// Minimum broker-confirmed closed volume (lots) that qualifies for reward
// release. Configurable; the gate itself is NON-NEGOTIABLE (compliance).
const MIN_QUALIFYING_LOTS = Number(process.env.BROKER_MIN_QUALIFYING_LOTS ?? 1);

export async function confirmCpaEvents(): Promise<void> {
  // Find accounts with FTD but no confirmed CPA event
  const accounts = await prisma.account.findMany({
    where: { ftdAt: { not: null }, verified: true, cpaEvents: { none: {} } },
  });

  for (const account of accounts) {
    const confirmed = await verifyFtdWithBroker(account);
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

/**
 * Verify broker-confirmed FTD + qualifying volume. Reward release is gated on
 * this returning true — NON-NEGOTIABLE. Routed by link type:
 *   • INVESTOR_PASSWORD → MT Manager gateway (read-only)
 *   • IB_API            → IB account summary (read-only)
 *   • OCR_FALLBACK      → never auto-confirms (low-trust, manual review only)
 */
async function verifyFtdWithBroker(account: {
  login: string;
  linkType: "IB_API" | "INVESTOR_PASSWORD" | "OCR_FALLBACK";
  platform: string | null;
}): Promise<boolean> {
  switch (account.linkType) {
    case "INVESTOR_PASSWORD":
      return verifyMtFtd(account.login, (account.platform as MtPlatform) || "MT5", MIN_QUALIFYING_LOTS);
    case "IB_API":
      return verifyIbFtd(account.login, MIN_QUALIFYING_LOTS);
    case "OCR_FALLBACK":
    default:
      // OCR statements are never sufficient to release rewards on their own.
      return false;
  }
}

async function verifyIbFtd(ibLogin: string, minQualifyingLots: number): Promise<boolean> {
  const baseUrl = process.env.IB_API_BASE_URL;
  const apiKey = process.env.IB_API_KEY;
  if (!baseUrl || !apiKey) return false;

  const res = await fetch(`${baseUrl}/v1/accounts/${ibLogin}/summary`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  });
  if (!res.ok) return false;

  const s = (await res.json()) as {
    firstDepositConfirmed: boolean;
    totalDeposits: number;
    closedVolumeLots: number;
  };
  return s.firstDepositConfirmed && s.totalDeposits > 0 && s.closedVolumeLots >= minQualifyingLots;
}
