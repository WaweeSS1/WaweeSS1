import cron from "node-cron";
import { PrismaClient } from "@fxking/db";
import { calculateRebate } from "@fxking/shared";
import { syncIbTrades } from "./adapters/ib-api";
import { syncMtTrades, type MtPlatform } from "./adapters/mt-manager";
import { confirmCpaEvents } from "./cpa-reconciliation";

const prisma = new PrismaClient();

// ── Cron: sync trades every 15 minutes ────────────────────────────────────
// Routes by link type. OCR_FALLBACK is NOT polled here — it is upload-driven
// (the API calls ingestStatement on statement upload) and is low-trust by
// design, so it never auto-releases rewards.
cron.schedule("*/15 * * * *", async () => {
  console.log("[broker-sync] Starting trade sync...");
  const accounts = await prisma.account.findMany({ where: { verified: true } });

  for (const account of accounts) {
    try {
      const since = account.lastSyncedAt?.toISOString();
      if (account.linkType === "IB_API") {
        await syncIbTrades(account.id, account.login);
      } else if (account.linkType === "INVESTOR_PASSWORD") {
        const platform = (account.platform as MtPlatform) || "MT5";
        await syncMtTrades(account.id, account.login, platform, since);
      } else {
        continue; // OCR_FALLBACK handled on upload, not on cron
      }
      await prisma.account.update({
        where: { id: account.id },
        data: { lastSyncedAt: new Date() },
      });
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
