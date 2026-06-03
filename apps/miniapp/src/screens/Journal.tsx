import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Period = "7d" | "30d" | "90d" | "all";

interface TradeEntry {
  id: string;
  pair: string;
  side: "BUY" | "SELL";
  lots: number;
  pnl: number;
  openedAt: string;
  closedAt: string;
}

const DEMO_TRADES: TradeEntry[] = [
  { id: "1", pair: "EURUSD", side: "BUY",  lots: 0.5, pnl: 142.50, openedAt: "2024-06-03T08:00Z", closedAt: "2024-06-03T14:00Z" },
  { id: "2", pair: "GBPUSD", side: "SELL", lots: 0.3, pnl: -67.20, openedAt: "2024-06-02T10:00Z", closedAt: "2024-06-02T16:30Z" },
  { id: "3", pair: "USDJPY", side: "BUY",  lots: 1.0, pnl: 88.00,  openedAt: "2024-06-01T09:00Z", closedAt: "2024-06-01T17:00Z" },
  { id: "4", pair: "EURUSD", side: "SELL", lots: 0.5, pnl: -120.00,openedAt: "2024-05-31T09:00Z", closedAt: "2024-05-31T11:00Z" },
  { id: "5", pair: "GBPJPY", side: "BUY",  lots: 0.2, pnl: 55.00,  openedAt: "2024-05-30T14:00Z", closedAt: "2024-05-30T18:00Z" },
];

const DEMO_STATS = {
  winRate: 60,
  totalLots: 2.5,
  maxDrawdown: 8.2,
  revengeTradeCount: 1,
  avgRR: 1.4,
};

function fmt(n: number) { return n.toFixed(2); }

export function JournalScreen() {
  const [period, setPeriod] = useState<Period>("30d");
  const navigate = useNavigate();

  const revengeWarning = DEMO_STATS.revengeTradeCount > 0;

  return (
    <div className="screen page-pad">
      <div className="screen-header" style={{ padding: "var(--sp-3) 0 var(--sp-4)" }}>
        <div className="screen-title">TRADE NAPLÓ</div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate("/risk")}>
          Risk Coach
        </button>
      </div>

      {/* Period tabs */}
      <div className="period-tabs">
        {(["7d","30d","90d","all"] as Period[]).map(p => (
          <button
            key={p}
            className={"period-tab" + (period === p ? " active" : "")}
            onClick={() => setPeriod(p)}
          >
            {p === "all" ? "Összes" : p}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: "var(--sp-3)" }}>
        <div className="stat-cell">
          <div className="readout__label">Win rate</div>
          <div className="readout__value sm amber">{DEMO_STATS.winRate}%</div>
        </div>
        <div className="stat-cell">
          <div className="readout__label">Avg R:R</div>
          <div className="readout__value sm">{DEMO_STATS.avgRR}</div>
        </div>
        <div className="stat-cell">
          <div className="readout__label">Max DD</div>
          <div className="readout__value sm negative">{DEMO_STATS.maxDrawdown}%</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-cell">
          <div className="readout__label">Összes lot</div>
          <div className="readout__value sm">{DEMO_STATS.totalLots}</div>
        </div>
        <div className="stat-cell">
          <div className="readout__label">Rebate (időszak)</div>
          <div className="readout__value sm amber">+$3.00</div>
        </div>
      </div>

      {/* Revenge trading alert */}
      {revengeWarning && (
        <div className="alert alert--warn" role="alert" style={{ marginTop: "var(--sp-3)" }}>
          ⚠ {DEMO_STATS.revengeTradeCount} lehetséges revenge trade észlelve ebben az időszakban.
          Veszteség utáni túlméretes pozíció — lassíts.
        </div>
      )}

      {/* Chart placeholder */}
      <div className="chart-area" style={{ marginTop: "var(--sp-3)" }}>
        <span className="chart-placeholder">P&L CHART — MT4/5 IMPORT UTÁN</span>
      </div>

      {/* Trade list */}
      <div className="panel" style={{ marginTop: "var(--sp-3)" }}>
        <div className="panel__header">
          <span className="panel__label">Zárt ügyletek</span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", color: "var(--ink-3)" }}>{DEMO_TRADES.length} db</span>
        </div>
        {DEMO_TRADES.map(t => (
          <div key={t.id} className="trade-row">
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
              <span className="trade-pair">{t.pair}</span>
              <span className="trade-meta">{t.side} · {t.lots} lot · {new Date(t.closedAt).toLocaleDateString("hu-HU")}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className={"trade-pnl" + (t.pnl >= 0 ? " pos" : " neg")}>
                {t.pnl >= 0 ? "+" : ""}${fmt(t.pnl)}
              </div>
              <div style={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", color: "var(--ink-3)" }}>
                +${(t.lots * 1.20).toFixed(2)} rebate
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="risk-box" style={{ marginTop: "var(--sp-3)" }} role="note">
        <strong>Figyelmeztetés</strong>
        A napló adatait a broker biztosítja — az FX·King nem vállal felelősséget az adatok pontosságáért. Ez nem befektetési tanács.
      </div>
    </div>
  );
}
