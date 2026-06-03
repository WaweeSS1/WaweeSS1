import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyTelegramInitData } from "@rebound/shared";

const PUBLIC_PATHS = ["/health", "/v1/referrals/validate"];

export async function authHook(req: FastifyRequest, reply: FastifyReply) {
  if (PUBLIC_PATHS.some((p) => req.url.startsWith(p))) return;

  const initData = req.headers["x-telegram-init-data"] as string | undefined;
  if (!initData) {
    reply.code(401).send({ ok: false, error: "Missing Telegram initData" });
    return;
  }

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) throw new Error("BOT_TOKEN not configured");

  const parsed = verifyTelegramInitData(initData, botToken);
  if (!parsed?.user) {
    reply.code(401).send({ ok: false, error: "Invalid or expired initData" });
    return;
  }

  (req as any).telegramUser = parsed.user;
}
