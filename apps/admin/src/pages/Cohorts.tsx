export function Cohorts() {
  const cohorts = [
    { month: "2024-03", users: 42, ftd: 38, avgLots: 8.2, revShare: 1972.8, rebatesPaid: 376.1, netLtv: 1596.7, retained12m: "~$3,193" },
    { month: "2024-04", users: 67, ftd: 61, avgLots: 9.4, revShare: 3401.7, rebatesPaid: 549.4, netLtv: 2852.3, retained12m: "~$5,705" },
    { month: "2024-05", users: 89, ftd: 79, avgLots: 7.8, revShare: 3699.4, rebatesPaid: 592.2, netLtv: 3107.2, retained12m: "~$6,214" },
    { month: "2024-06", users: 34, ftd: 18, avgLots: 6.1, revShare: 656.8,  rebatesPaid: 130.2, netLtv: 526.6,  retained12m: "TBD" },
  ];

  return (
    <>
      <div className="admin-topbar"><span className="topbar-title">COHORT / LTV ELEMZÉS</span></div>
      <div className="admin-content">
        <div className="metric-grid">
          <div className="metric-card metric-card--accent">
            <div className="metric-card__label">Retained trader LTV (10 lot/hó, 12 hó)</div>
            <div className="metric-card__value amber">$524</div>
            <div className="metric-card__sub">nettó / év / felhasználó</div>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">Standard rebate rate</div>
            <div className="metric-card__value">$1.20</div>
            <div className="metric-card__sub">/ lot · VIP: $1.60</div>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">RevShare gross (30%)</div>
            <div className="metric-card__value">$2.40</div>
            <div className="metric-card__sub">/ lot · ~$8 broker-nettó</div>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">Break-even invitáció</div>
            <div className="metric-card__value">~1.5</div>
            <div className="metric-card__sub">invite / CPA nettó visszatermelés</div>
          </div>
        </div>
        <div className="admin-table-wrap">
          <div className="admin-table-header"><span className="admin-table-title">Havi cohort teljesítmény</span></div>
          <table className="admin-table">
            <thead><tr>
              <th>Cohort</th><th className="num">Signup</th><th className="num">FTD</th>
              <th className="num">Avg lot/hó</th><th className="num">RevShare gross</th>
              <th className="num">Rebate kif.</th><th className="num">Nettó LTV (1hó)</th>
              <th className="num">12 hó est.</th>
            </tr></thead>
            <tbody>
              {cohorts.map(c => (
                <tr key={c.month}>
                  <td style={{ fontFamily: "var(--font-data)", color: "var(--ink)" }}>{c.month}</td>
                  <td className="num">{c.users}</td>
                  <td className="num amber">{c.ftd}</td>
                  <td className="num">{c.avgLots}</td>
                  <td className="num positive">${c.revShare.toFixed(0)}</td>
                  <td className="num negative">-${c.rebatesPaid.toFixed(0)}</td>
                  <td className="num amber">${c.netLtv.toFixed(0)}</td>
                  <td className="num" style={{ color: "var(--ink-2)" }}>{c.retained12m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="risk-bar" style={{ marginTop: "var(--sp-4)" }} role="note">
          <strong>Megjegyzés:</strong> A fenti számok demo adatok — a valós RevShare-t a broker-nettó riportból kell felülírni. LTV feltételezi a teljes 12 hónapos retenciót.
        </div>
      </div>
    </>
  );
}
