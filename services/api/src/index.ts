import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { walletRoutes } from "./routes/wallet";
import { tradeRoutes } from "./routes/trades";
import { rebateRoutes } from "./routes/rebates";
import { referralRoutes } from "./routes/referrals";
import { payoutRoutes } from "./routes/payouts";
import { authHook } from "./hooks/auth";

const app = Fastify({ logger: true });

async function bootstrap() {
  await app.register(helmet);
  await app.register(cors, {
    origin: [
      process.env.LANDING_URL ?? "https://rebound.app",
      process.env.WEBAPP_URL ?? "https://miniapp.rebound.app",
      process.env.ADMIN_URL ?? "https://admin.rebound.app",
    ],
    credentials: true,
  });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  app.addHook("preHandler", authHook);

  await app.register(walletRoutes, { prefix: "/v1/wallet" });
  await app.register(tradeRoutes, { prefix: "/v1/trades" });
  await app.register(rebateRoutes, { prefix: "/v1/rebates" });
  await app.register(referralRoutes, { prefix: "/v1/referrals" });
  await app.register(payoutRoutes, { prefix: "/v1/payouts" });

  app.get("/health", async () => ({ ok: true, ts: new Date().toISOString() }));

  await app.listen({ port: 3001, host: "0.0.0.0" });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
