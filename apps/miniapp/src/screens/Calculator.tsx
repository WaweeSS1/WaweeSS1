import { useState, useMemo } from "react";

const PAIRS: Record<string, number> = {
  "EURUSD": 1.08,
  "GBPUSD": 1.27,
  "USDJPY": 157.5,
  "USDCHF": 0.91,
  "AUDUSD": 0.66,
  "USDCAD": 1.37,
  "GBPJPY": 200.2,
};

export function CalculatorScreen() {
  const [pair, setPair] = useState("EURUSD");
  const [accountUsd, setAccountUsd] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [stopPips, setStopPips] = useState(20);

  const result = useMemo(() => {
    const riskUsd = (accountUsd * riskPct) / 100;
    const pipValue = pair.includes("JPY") ? 0.01 : 0.0001;
    const pipValueUsd = pair.startsWith("USD")
      ? pipValue * (1 / PAIRS[pair])
      : pipValue * PAIRS[pair];
    const lots = stopPips === 0 ? 0 : riskUsd / (stopPips * pipValueUsd * 100000);
    const rebate = lots * 1.20;
    return {
      riskUsd: riskUsd.toFixed(2),
      lots: Math.max(0, lots).toFixed(3),
      rebate: rebate.toFixed(3),
    };
  }, [pair, accountUsd, riskPct, stopPips]);

  return (
    <div className="screen page-pad">
      <div className="screen-header" style={{ padding: "var(--sp-3) 0 var(--sp-4)" }}>
        <div className="screen-title">POZÍCIÓMÉRET KALKULÁTOR</div>
      </div>

      <div className="panel panel--accent" style={{ marginBottom: "var(--sp-3)" }}>
        <div className="panel__header"><span className="panel__label">Paraméterek</span></div>
        <div className="panel__body">

          <div className="input-group">
            <label className="input-label" htmlFor="pair">Devizapár</label>
            <select
              id="pair"
              className="input"
              value={pair}
              onChange={e => setPair(e.target.value)}
            >
              {Object.keys(PAIRS).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="account">Számla mérete (USD)</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">$</span>
              <input id="account" type="number" className="input" min={100} max={1000000} step={1000}
                value={accountUsd} onChange={e => setAccountUsd(Number(e.target.value))} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="risk">Kockázat (%)</label>
            <input id="risk" type="number" className="input" min={0.1} max={10} step={0.1}
              value={riskPct} onChange={e => setRiskPct(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="stop">Stop-loss (pip)</label>
            <input id="stop" type="number" className="input" min={1} max={500} step={1}
              value={stopPips} onChange={e => setStopPips(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="panel">
        <div className="panel__header"><span className="panel__label">Eredmény</span></div>
        <div className="panel__body">
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            <div className="stat-cell">
              <div className="readout__label">Kockázat</div>
              <div className="readout__value sm negative">${result.riskUsd}</div>
            </div>
            <div className="stat-cell">
              <div className="readout__label">Lot méret</div>
              <div className="readout__value sm amber">{result.lots}</div>
            </div>
            <div className="stat-cell">
              <div className="readout__label">Rebate (est.)</div>
              <div className="readout__value sm" style={{ color: "var(--ink-2)" }}>+${result.rebate}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: "var(--sp-3)" }}>
        <div className="panel__header"><span className="panel__label">Rebate táblázat · {pair}</span></div>
        <div className="panel__body" style={{ padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-data)", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ background: "rgba(13,17,23,0.5)" }}>
                <th style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "left", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 400 }}>Lot</th>
                <th style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "right", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 400 }}>Standard</th>
                <th style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "right", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--amber)", fontWeight: 400 }}>VIP</th>
              </tr>
            </thead>
            <tbody>
              {[0.1, 0.5, 1, 5, 10].map(l => (
                <tr key={l} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "var(--sp-2) var(--sp-3)", color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>{l}</td>
                  <td style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "right", color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>${(l * 1.20).toFixed(2)}</td>
                  <td style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "right", color: "var(--amber)", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>${(l * 1.60).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="risk-box" style={{ marginTop: "var(--sp-3)" }} role="note">
        <strong>Megjegyzés</strong>
        A kalkuláció tájékoztató jellegű. A valós pip értékek az aktuális árfolyamtól és a broker spreadjétől függnek. Tools, not tips.
      </div>
    </div>
  );
}
