export function Dashboard() {
  const stats = [
    { label: "Aktív felhasználók", value: "1,247", sub: "+34 ma", accent: false },
    { label: "Kifizetett rebate (MTD)", value: "$8,420", sub: "2024 jún.", accent: true },
    { label: "Pending payout", value: "23", sub: "$4,160 összesen", accent: false },
    { label: "Fraud flag (nyitott)", value: "4", sub: "review szükséges", accent: false },
    { label: "CPA megerősítve (MTD)", value: "18", sub: "$10,800 gross", accent: true },
    { label: "RevShare (LTM est.)", value: "$34,200", sub: "30% · ~$8/lot", accent: false },
  ];

  const recentCpa = [
    { id: "CPA-001", user: "@trading_janos", broker: "IBKR", ftdDate: "2024-06-01", amount: 600, status: "CONFIRMED" },
    { id: "CPA-002", user: "@forex_kati",    broker: "IBKR", ftdDate: "2024-06-02", amount: 600, status: "CONFIRMED" },
    { id: "CPA-003", user: "@peter_trader",  broker: "IBKR", ftdDate: "2024-06-03", amount: 600, status: "PENDING" },
  ];

  return (
    <>
      <div className="admin-topbar">
        <span className="topbar-title">REBOUND / DASHBOARD</span>
        <div className="topbar-actions">
          <span style={{ fontFamily: "var(--font-data)", fontSize: "0.62rem", color: "var(--amber)" }}>● LIVE</span>
        </div>
      </div>
      <div className="admin-content">
        <div className="risk-bar" role="note">
          <strong>ADMIN KONZOL:</strong> Payout jóváhagyás és fraud review — minden döntés naplózva. Jutalom csak megerősített CPA után szabadítható fel.
        </div>

        <div className="metric-grid">
          {stats.map(s => (
            <div key={s.label} className={"metric-card" + (s.accent ? " metric-card--accent" : "")}>
              <div className="metric-card__label">{s.label}</div>
              <div className={"metric-card__value" + (s.accent ? " amber" : "")}>{s.value}</div>
              <div className="metric-card__sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <span className="admin-table-title">Legutóbbi CPA események</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Felhasználó</th><th>Broker</th><th>FTD dátum</th>
                <th className="num">CPA összeg</th><th>Státusz</th>
              </tr>
            </thead>
            <tbody>
              {recentCpa.map(r => (
                <tr key={r.id}>
                  <td style={{ color: "var(--ink-3)", fontSize: "0.7rem" }}>{r.id}</td>
                  <td>{r.user}</td>
                  <td style={{ color: "var(--ink-3)" }}>{r.broker}</td>
                  <td style={{ color: "var(--ink-3)" }}>{r.ftdDate}</td>
                  <td className="num amber">${r.amount}</td>
                  <td><span className={"badge badge--" + (r.status === "CONFIRMED" ? "approved" : "pending")}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
