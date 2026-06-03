import crypto from "crypto";

export interface TelegramInitData {
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  auth_date: number;
  hash: string;
  start_param?: string; // referral code via deep link
}

export function verifyTelegramInitData(
  initData: string,
  botToken: string
): TelegramInitData | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const expectedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (expectedHash !== hash) return null;

  const authDate = parseInt(params.get("auth_date") ?? "0", 10);
  const fiveMinutes = 5 * 60;
  if (Date.now() / 1000 - authDate > fiveMinutes) return null;

  const userJson = params.get("user");
  return {
    user: userJson ? JSON.parse(userJson) : undefined,
    auth_date: authDate,
    hash,
    start_param: params.get("start_param") ?? undefined,
  };
}
