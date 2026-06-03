const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.fxking.io";

function getInitData(): string {
  if (typeof window !== "undefined" && window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }
  return "";
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-telegram-init-data": getInitData(),
      ...options?.headers,
    },
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error ?? "API error");
  return data.data as T;
}

// Typed API calls
export const api = {
  wallet: {
    balance: () => apiFetch<import("@fxking/shared").WalletBalance>("/v1/wallet"),
    history: () => apiFetch<unknown[]>("/v1/wallet/history"),
  },
  trades: {
    stats: (period = "30d") => apiFetch<import("@fxking/shared").TradeStats>(`/v1/trades/stats?period=${period}`),
  },
  rebates: {
    summary: () => apiFetch<import("@fxking/shared").RebateSummary>("/v1/rebates/summary"),
  },
  referrals: {
    get: () => apiFetch<unknown>("/v1/referrals"),
  },
  payouts: {
    request: (amount: number, method: string) =>
      apiFetch("/v1/payouts/request", {
        method: "POST",
        body: JSON.stringify({ amount, method }),
      }),
    history: () => apiFetch<unknown[]>("/v1/payouts/history"),
  },
};
