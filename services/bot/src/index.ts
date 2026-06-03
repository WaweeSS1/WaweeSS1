import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { PrismaClient } from "@fxking/db";
import { COMPLIANCE } from "@fxking/shared";

const prisma = new PrismaClient();
const bot = new Bot(process.env.BOT_TOKEN!);

// ── /start  ───────────────────────────────────────────────────────────────
bot.command("start", async (ctx) => {
  const tgUser = ctx.from!;
  const startParam = ctx.match; // referral code from deep-link

  // Upsert user
  let user = await prisma.user.upsert({
    where: { tgId: String(tgUser.id) },
    update: {},
    create: {
      tgId: String(tgUser.id),
      tgUsername: tgUser.username,
      skillLevel: "BEGINNER",
    },
  });

  // Handle referral deep-link
  if (startParam && startParam !== user.referralCode) {
    const inviter = await prisma.user.findUnique({ where: { referralCode: startParam } });
    if (inviter && inviter.id !== user.id) {
      await prisma.referral.upsert({
        where: { inviteeId: user.id },
        update: {},
        create: { inviterId: inviter.id, inviteeId: user.id },
      });
    }
  }

  const keyboard = new InlineKeyboard()
    .webApp("Nyisd meg az FX·King appot", process.env.WEBAPP_URL!)
    .row()
    .text("Referral kódom", "referral_code")
    .text("Payout státusz", "payout_status");

  await ctx.reply(
    `Üdv, ${tgUser.first_name}!\n\n` +
    `FX·King — cash rebate a valódi kereskedésedért.\n\n` +
    `${COMPLIANCE.RISK_WARNING.SHORT}\n\n` +
    `Tools, not tips.`,
    { reply_markup: keyboard }
  );
});

// ── Callback: referral kód ─────────────────────────────────────────────────
bot.callbackQuery("referral_code", async (ctx) => {
  const user = await prisma.user.findUnique({ where: { tgId: String(ctx.from.id) } });
  if (!user) return ctx.answerCallbackQuery("Felhasználó nem található.");

  const deepLink = `https://t.me/${process.env.BOT_USERNAME}?start=${user.referralCode}`;
  await ctx.editMessageText(
    `Referral kódod: \`${user.referralCode}\`\n\n` +
    `Deep-link: ${deepLink}\n\n` +
    `Jutalom csak broker-megerősített FTD után kerül jóváírásra.`,
    { parse_mode: "Markdown" }
  );
  await ctx.answerCallbackQuery();
});

// ── Callback: payout státusz ───────────────────────────────────────────────
bot.callbackQuery("payout_status", async (ctx) => {
  const user = await prisma.user.findUnique({ where: { tgId: String(ctx.from.id) } });
  if (!user) return ctx.answerCallbackQuery("Felhasználó nem található.");

  const latest = await prisma.payout.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    await ctx.editMessageText("Még nincs payout kérésed.");
  } else {
    await ctx.editMessageText(
      `Legutóbbi payout:\n` +
      `Összeg: $${Number(latest.amount)}\n` +
      `Státusz: ${latest.status}\n` +
      `${latest.txHash ? `TX: ${latest.txHash}` : ""}`.trim()
    );
  }
  await ctx.answerCallbackQuery();
});

// ── Start the bot ─────────────────────────────────────────────────────────
const useWebhook = process.env.WEBHOOK_MODE === "true";

if (useWebhook) {
  // Production: webhook via Fastify or Express
  console.log("Bot running in webhook mode");
} else {
  bot.start({ onStart: () => console.log("FX·King bot started (long-polling)") });
}

export { bot, webhookCallback };
