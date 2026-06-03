import { COMPLIANCE } from "./compliance";

export type TierType = "STANDARD" | "VIP";

export interface RebateCalculation {
  lots: number;
  ratePerLot: number;
  cashAmount: number;
  tier: TierType;
  isPayable: boolean; // MINDIG true — soha nem trade-locked
}

export function calculateRebate(lots: number, tier: TierType): RebateCalculation {
  const rate = COMPLIANCE.REBATE_RATE[tier];
  const cashAmount = Math.round(lots * rate * 100) / 100;

  return {
    lots,
    ratePerLot: rate,
    cashAmount,
    tier,
    isPayable: true, // Cash rebate — kifizethető, SOHA nem trade-locked
  };
}

export interface CpaDistribution {
  netMargin: number;
  welcomeCash: number;
  referralCash: number;
  opex: number;
  total: number;
}

export function getCpaDistribution(): CpaDistribution {
  const d = COMPLIANCE.CPA_DISTRIBUTION;
  return {
    netMargin: d.NET_MARGIN_USD,
    welcomeCash: d.WELCOME_CASH_USD,
    referralCash: d.REFERRAL_CASH_USD,
    opex: d.OPEX_USD,
    total: d.NET_MARGIN_USD + d.WELCOME_CASH_USD + d.REFERRAL_CASH_USD + d.OPEX_USD,
  };
}

export interface LtvProjection {
  monthlyLots: number;
  months: number;
  tier: TierType;
  grossRevShare: number;    // 30% RevShare
  rebatesPaid: number;      // felhasználónak visszaadott
  netRevShare: number;
  cpaNetMargin: number;
  totalNetLtv: number;
}

export function projectLtv(
  monthlyLots: number,
  months: number,
  tier: TierType,
  brokerNetPerLot: number = 8
): LtvProjection {
  const revShareRate = 0.30;
  const grossRevShare = monthlyLots * months * brokerNetPerLot * revShareRate;
  const rebateRate = COMPLIANCE.REBATE_RATE[tier];
  const rebatesPaid = monthlyLots * months * rebateRate;
  const netRevShare = grossRevShare - rebatesPaid;
  const cpaNetMargin = COMPLIANCE.CPA_DISTRIBUTION.NET_MARGIN_USD;

  return {
    monthlyLots,
    months,
    tier,
    grossRevShare: Math.round(grossRevShare * 100) / 100,
    rebatesPaid: Math.round(rebatesPaid * 100) / 100,
    netRevShare: Math.round(netRevShare * 100) / 100,
    cpaNetMargin,
    totalNetLtv: Math.round((cpaNetMargin + netRevShare) * 100) / 100,
  };
}
