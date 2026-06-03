import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface WalletData {
  rebateBalance: number;
  rewardBalance: number;
  totalPayable: number;
  currency: "USD";
  isPayable: boolean;
}

interface WalletEntry {
  id: string;
  type: "REBATE" | "REWARD";
  op: "CREDIT" | "DEBIT";
  amount: number;
  note?: string;
  createdAt: string;
}

// Demo data — replaced by real API calls in production
const DEMO_WALLET: WalletData = {
  rebateBalance: 182.40,
  rewardBalance: 100.00,
  totalPayable: 282.40,
  currency: "USD",
  isPayable: true,
};

const DEMO_HISTORY: WalletEntry[] = [
  { id: "1", type: "REBATE", op: "CREDIT", amount: 18.00, note: "15 lot · EURUSD", createdAt: "2024-06-03T14:00:00Z" },
  { id: "2", type: "REBATE", op: "CREDIT", amount: 8.40, note: "7 lot · GBPUSD", createdAt: "2024-06-02T09:30:00Z" },
  { id: "3", type: "REWARD", op: "CREDIT", amount: 100.00, note: "Welcome reward – FTD megerősítve", createdAt: "2024-06-01T00:00:00Z" },
  { id: "4", type: "REBATE", op: "DEBIT", amount: 80.00, note: "Payout – USDC BEP-20", createdAt: "2024-05-28T11:00:00Z" },
];

function fmt(n: number) {
  return n.toFixed(2);
}

function relativeDate(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "most";
  if (diff < 3600) return `${Math.floor(diff / 60)} perce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} órája`;
  return `${Math.floor(diff / 86400)} napja`;
}

export function WalletScreen() {
  const [wallet, setWallet] = useState<WalletData>(DEMO_WALLET);
  const [history, setHistory] = useState<WalletEntry[]>(DEMO_HISTORY);
  const navigate = useNavigate();

  return (
    <div className="screen page-pad">
      {/* Header */}
      <div className="screen-header" style={{ padding: "var(--sp-3) 0 var(--sp-4)" }}>
        <div className="screen-title">FX·KING / WALLET</div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
          <span className="status-dot" />
          <span style={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", letterSpacing: "0.16em", color: "var(--amber)", textTransform: "uppercase" }}>LIVE</span>
        </div>
      </div>

      {/* Main balance */}
      <div className="panel panel--accent" style={{ marginBottom: "var(--sp-3)" }}>
        <div className="panel__header">
          <span className="panel__label">Kifizetendő egyenleg</span>
          <span className="badge badge--amber">CASH · NEM TRADE-LOCKED</span>
        </div>
        <div className="panel__body">
          <div className="readout">
            <div className="readout__value amber lg">${fmt(wallet.totalPayable)}</div>
            <div className="readout__sub">USD · $20-TÓL KÉRHETŐ PAYOUT</div>
          </div>
          <div style={{ marginTop: "var(--sp-4)", display: "flex", gap: "var(--sp-3)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: "var(--sp-1)" }}>Rebate</div>
              <div style={{ fontFamily: "var(--font-data)", fontSize: "1.1rem", fontVariantNumeric: "tabular-nums", color: "var(--ink)", fontWeight: 700 }}>${fmt(wallet.rebateBalance)}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: "var(--sp-1)" }}>Jutalom</div>
              <div style={{ fontFamily: "var(--font-data)", fontSize: "1.1rem", fontVariantNumeric: "tabular-nums", color: "var(--ink)", fontWeight: 700 }}>${fmt(wallet.rewardBalance)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
        <button
          className="btn btn-primary"
          style={{ flex: 2 }}
          onClick={() => navigate("/payout")}
          disabled={wallet.totalPayable < 20}
        >
          Payout kérése →
        </button>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate("/journal")}>
          Napló
        </button>
      </div>

      {/* Quick stats row */}
      <div className="stat-grid" style={{ marginBottom: "var(--sp-4)" }}>
        <div className="stat-cell">
          <div className="readout__label">Folyó hónap</div>
          <div className="readout__value sm amber">+$26.40</div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", color: "var(--ink-3)", marginTop: "2px" }}>22 lot</div>
        </div>
        <div className="stat-cell">
          <div className="readout__label">Referral</div>
          <div className="readout__value sm amber">1 actv.</div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", color: "var(--ink-3)", marginTop: "2px" }}>1 pending</div>
        </div>
      </div>

      {/* Risk warning */}
      <div className="risk-box" role="note">
        <strong>Tools, not tips.</strong>
        A rebate a kereskedési volumeneden alapul — nem profitgarancia. CFD/forex magas kockázatú termék.
      </div>

      {/* Ledger history */}
      <div className="panel">
        <div className="panel__header">
          <span className="panel__label">Ledger history</span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", color: "var(--ink-3)" }}>APPEND-ONLY</span>
        </div>
        <div>
          {history.map(entry => (
            <div key={entry.id} className="panel__row">
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontFamily: "var(--font-data)", fontSize: "0.75rem", color: "var(--ink-2)" }}>
                  {entry.type === "REBATE" ? "Rebate" : "Jutalom"}
                  {entry.note && <span style={{ color: "var(--ink-3)", marginLeft: "var(--sp-2)" }}>· {entry.note}</span>}
                </span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", color: "var(--ink-3)", letterSpacing: "0.06em" }}>{relativeDate(entry.createdAt)}</span>
              </div>
              <span className="panel__row-value" style={{ color: entry.op === "CREDIT" ? "var(--amber)" : "var(--negative)" }}>
                {entry.op === "CREDIT" ? "+" : "−"}${fmt(entry.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
