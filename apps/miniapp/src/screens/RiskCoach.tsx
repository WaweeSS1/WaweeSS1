import { useState } from "react";

const SKILL_LEVEL = localStorage.getItem("rebound_skill") ?? "BEGINNER";
const IS_BEGINNER = SKILL_LEVEL === "BEGINNER";

export function RiskCoachScreen() {
  const [dailyLimit, setDailyLimit] = useState(2);
  const [dailyLoss, setDailyLoss] = useState(0.8);
  const [overtradeWarn, setOvertradeWarn] = useState(true);
  const [positionWarn, setPositionWarn] = useState(IS_BEGINNER);

  const limitPct = (dailyLoss / dailyLimit) * 100;
  const isNearLimit = limitPct >= 70;
  const isAtLimit = limitPct >= 100;

  return (
    <div className="screen page-pad">
      <div className="screen-header" style={{ padding: "var(--sp-3) 0 var(--sp-4)" }}>
        <div className="screen-title">RISK COACH</div>
        {IS_BEGINNER && <span className="badge badge--amber">KEZDŐ MÓD</span>}
      </div>

      {/* Daily loss gauge */}
      <div className="panel panel--accent" style={{ marginBottom: "var(--sp-3)" }}>
        <div className="panel__header">
          <span className="panel__label">Napi veszteséglimit</span>
          <span className="badge badge--neutral">AKTÍV</span>
        </div>
        <div className="panel__body">
          <div className="readout" style={{ marginBottom: "var(--sp-3)" }}>
            <div className="readout__label">Mai veszteség</div>
            <div className={"readout__value lg" + (isAtLimit ? " negative" : isNearLimit ? " amber" : "")}>
              ${dailyLoss.toFixed(2)}
            </div>
            <div className="readout__sub">/ ${dailyLimit.toFixed(2)} limit ({Math.round(limitPct)}%)</div>
          </div>

          {/* Progress bar */}
          <div style={{ background: "var(--border)", borderRadius: "2px", height: "6px", marginBottom: "var(--sp-3)" }}>
            <div style={{
              height: "100%",
              borderRadius: "2px",
              width: `${Math.min(limitPct, 100)}%`,
              background: isAtLimit ? "var(--negative)" : isNearLimit ? "var(--amber)" : "var(--amber-dim)",
              transition: "width 0.3s, background 0.3s",
            }} />
          </div>

          {isAtLimit && (
            <div className="alert alert--warn" role="alert">
              ⛔ Elérted a napi veszteségkeretedet. Állj meg. Holnap folytatod.
            </div>
          )}
          {isNearLimit && !isAtLimit && (
            <div className="alert alert--info" role="alert">
              ⚠ 70%-nál jársz. Légy óvatos.
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="daily-limit">Napi limit (USD)</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">$</span>
              <input
                id="daily-limit"
                type="number"
                className="input"
                min={10}
                max={10000}
                step={10}
                value={dailyLimit}
                onChange={e => setDailyLimit(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Guardrail settings */}
      <div className="panel" style={{ marginBottom: "var(--sp-3)" }}>
        <div className="panel__header">
          <span className="panel__label">Guardrailek</span>
          {IS_BEGINNER && <span style={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", color: "var(--amber-dim)" }}>KEZDŐKNEK RÖGZÍTETT</span>}
        </div>
        <div className="panel__body" style={{ padding: "0 var(--sp-3)" }}>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-name">Túlkereskedés-figyelmeztetés</span>
              <span className="toggle-desc">ha napi átlag 2x-es lot felett nyitsz</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={overtradeWarn}
                onChange={e => setOvertradeWarn(e.target.checked)}
                disabled={IS_BEGINNER}
                aria-label="Túlkereskedés-figyelmeztetés"
              />
              <span className="toggle-track" />
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-name">Pozícióméret-kötelező</span>
              <span className="toggle-desc">kalkulátor nélkül nem nyitható ügylet</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={positionWarn}
                onChange={e => setPositionWarn(e.target.checked)}
                disabled={IS_BEGINNER}
                aria-label="Pozícióméret-kötelező"
              />
              <span className="toggle-track" />
            </label>
          </div>

        </div>
      </div>

      {IS_BEGINNER && (
        <div className="risk-box" role="note">
          <strong>Kezdő mód — guardrailek rögzítve</strong>
          Haladó vagy tapasztalt profil kiválasztásával módosíthatók. Ez a beállítás tudatos döntést igényel, nem egy érintés.
        </div>
      )}

      <div className="risk-box" role="note">
        <strong>Figyelmeztetés</strong>
        A risk coach javaslatokat ad — nem dönt helyetted, nem vállal felelősséget. CFD/forex magas kockázatú termék. Tools, not tips.
      </div>
    </div>
  );
}
