// Shared domain types across all services

export type UserId = string;
export type AccountId = string;
export type TradeId = string;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface WalletBalance {
  rebateBalance: number;   // kifizethető cash — SOHA nem trade-locked
  rewardBalance: number;   // welcome / referral (CPA-megerősített)
  totalPayable: number;
  currency: "USD";
}

export interface TradeStats {
  totalLots: number;
  winRate: number;
  averageRR: number;
  maxDrawdown: number;
  revengeTradeCount: number;
  period: "7d" | "30d" | "90d" | "all";
}

export interface RebateSummary {
  pendingUsd: number;
  confirmedUsd: number;
  paidUsd: number;
  currentMonthUsd: number;
}
