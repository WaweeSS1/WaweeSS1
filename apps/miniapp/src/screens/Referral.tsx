import { useState } from "react";

const DEMO_REFERRALS = [
  { id: "1", username: "@trading_janos", qualifiedAt: "2024-06-01T00:00Z", reward: 80, clawedBack: false },
  { id: "2", username: "@forex_kati",    qualifiedAt: null,                  reward: null, clawedBack: false },
];

const MY_CODE = "FXKING-A1B2C3";
const BOT_USERNAME = "FXKingBot";
const DEEP_LINK = `https://t.me/${BOT_USERNAME}?start=${MY_CODE}`;

export function ReferralScreen() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(DEEP_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const qualified = DEMO_REFERRALS.filter(r => r.qualifiedAt);
  const pending   = DEMO_REFERRALS.filter(r => !r.qualifiedAt);
  const totalEarned = qualified.reduce((a, r) => a + (r.reward ?? 0), 0);

  return (
    <div className="screen page-pad">
      <div className="screen-header" style={{ padding: "var(--sp-3) 0 var(--sp-4)" }}>
        <div className="screen-title">REFERRAL PROGRAM</div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: "var(--sp-4)" }}>
        <div className="stat-cell">
          <div className="readout__label">Meghívva</div>
          <div className="readout__value sm">{DEMO_REFERRALS.length}</div>
        </div>
        <div className="stat-cell">
          <div className="readout__label">Qualified</div>
          <div className="readout__value sm amber">{qualified.length}</div>
        </div>
        <div className="stat-cell">
          <div className="readout__label">Keresett</div>
          <div className="readout__value sm amber">${totalEarned}</div>
        </div>
      </div>

      {/* Referral code */}
      <div className="panel panel--accent" style={{ marginBottom: "var(--sp-4)" }}>
        <div className="panel__header"><span className="panel__label">Referral kódod</span></div>
        <div className="panel__body">
          <div className="ref-code-box">
            <span className="ref-code">{MY_CODE}</span>
            <button className={"copy-btn" + (copied ? " copied" : "")} onClick={copyLink}>
              {copied ? "✓ Másolva" : "Másolás"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={copyLink}>
              Megosztás →
            </button>
            {typeof window !== "undefined" && window.Telegram?.WebApp && (
              <button
                className="btn btn-outline"
                onClick={() => window.Telegram?.WebApp?.switchInlineQuery?.(
                  `Kereskedj okosabban: ${DEEP_LINK}`, ["users"]
                )}
              >
                Telegram
              </button>
            )}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="panel" style={{ marginBottom: "var(--sp-4)" }}>
        <div className="panel__header"><span className="panel__label">Hogy működik</span></div>
        <div className="panel__body" style={{ padding: "0 var(--sp-3)" }}>
          <div className="panel__row">
            <span className="panel__row-label">Signup után (XP)</span>
            <span className="panel__row-value" style={{ color: "var(--ink-3)" }}>nincs cash</span>
          </div>
          <div className="panel__row">
            <span className="panel__row-label">FTD megerősítve</span>
            <span className="panel__row-value amber">+$80 cash</span>
          </div>
          <div className="panel__row">
            <span className="panel__row-label">Clawback (CPA visszavont)</span>
            <span className="panel__row-value negative">jutalom visszavonva</span>
          </div>
        </div>
      </div>

      {/* Referral list */}
      {qualified.length > 0 && (
        <div className="panel" style={{ marginBottom: "var(--sp-3)" }}>
          <div className="panel__header">
            <span className="panel__label">Qualified</span>
            <span className="badge badge--success">{qualified.length}</span>
          </div>
          {qualified.map(r => (
            <div key={r.id} className="panel__row">
              <div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: "0.82rem", color: "var(--ink)" }}>{r.username}</div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: "0.6rem", color: "var(--ink-3)" }}>
                  {r.qualifiedAt ? new Date(r.qualifiedAt).toLocaleDateString("hu-HU") : ""}
                </div>
              </div>
              <span className="panel__row-value amber">+${r.reward}</span>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div className="panel" style={{ marginBottom: "var(--sp-3)" }}>
          <div className="panel__header">
            <span className="panel__label">Pending (FTD nem erősítve)</span>
            <span className="badge badge--neutral">{pending.length}</span>
          </div>
          {pending.map(r => (
            <div key={r.id} className="panel__row">
              <span style={{ fontFamily: "var(--font-data)", fontSize: "0.82rem", color: "var(--ink-2)" }}>{r.username}</span>
              <span className="panel__row-value" style={{ color: "var(--ink-3)" }}>várakozik</span>
            </div>
          ))}
        </div>
      )}

      <div className="risk-box" role="note">
        <strong>Fontos</strong>
        Referral cash csak broker által megerősített FTD + qualifying volume után kerül jóváírásra. Clawback érvényes.
      </div>
    </div>
  );
}
