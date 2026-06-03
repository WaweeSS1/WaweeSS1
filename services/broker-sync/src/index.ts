import cron from "node-cron";
import { PrismaClient } from "@fxking/db";
import { calculateRebate } from "@fxking/shared";
import { syncIbTrades } from "./adapters/ib-api";
import { confirmCpaEvents } from "./cpa-reconciliation";

const prisma = new PrismaClient();

// ── Cron: sync trades every 15 minutes ────────────────────────────────────
cron.schedule("*/15 * * * *", async () => {
  console.log("[broker-sync] Starting trade sync...");
  const accounts = await prisma.account.findMany({ where: { verified: true } });

  for (const account of accounts) {
    try {
      if (account.linkType === "IB_API") {
        await syncIbTrades(account.id, account.login);
      }
      // MT4/5 and OCR adapters would go here
    } catch (err) {
      console.error(`[broker-sync] Error syncing account ${account.id}:`, err);
    }
  }
});

// ── Cron: compute rebates every hour ──────────────────────────────────────
cron.schedule("0 * * * *", async () => {
  console.log("[broker-sync] Computing rebates...");
  const pendingTrades = await prisma.trade.findMany({
    where: { rebates: { none: {} }, closedAt: { not: null } },
    include: { account: { include: { user: true } } },
  });

  for (const trade of pendingTrades) {
    const tier = trade.account.user.tier;
    const calc = calculateRebate(Number(trade.lots), tier);

    await prisma.rebate.create({
      data: {
        tradeId: trade.id,
        lots: trade.lots,
        rate: calc.ratePerLot,
        amount: calc.cashAmount,
        status: "PENDING",
      },
    });
  }
});

// ── Cron: CPA reconciliation every 6 hours ────────────────────────────────
cron.schedule("0 */6 * * *", async () => {
  console.log("[broker-sync] CPA reconciliation...");
  await confirmCpaEvents();
});

console.log("[broker-sync] Service started. Crons scheduled.");
