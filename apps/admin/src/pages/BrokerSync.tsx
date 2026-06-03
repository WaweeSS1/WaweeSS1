export function BrokerSync() {
  const jobs = [
    { id: "JOB-001", type: "IB_API_SYNC",     status: "OK",    lastRun: "2024-06-03T14:00Z", accounts: 89, trades: 312, error: null },
    { id: "JOB-002", type: "REBATE_COMPUTE",  status: "OK",    lastRun: "2024-06-03T14:00Z", accounts: 89, trades: 312, error: null },
    { id: "JOB-003", type: "CPA_RECONCILE",   status: "WARN",  lastRun: "2024-06-03T08:00Z", accounts: 3,  trades: 0,   error: "2 FTD broker-visszaigazolás függőben > 48h" },
    { id: "JOB-004", type: "MT4_SYNC",        status: "ERROR", lastRun: "2024-06-02T20:00Z", accounts: 0,  trades: 0,   error: "MT4 Manager API connection timeout" },
  ];

  return (
    <>
      <div className="admin-topbar"><span className="topbar-title">BROKER SYNC ÁLLAPOT</span></div>
      <div className="admin-content">
        <div className="admin-table-wrap">
          <div className="admin-table-header"><span className="admin-table-title">Szinkronizációs feladatok</span></div>
          <table className="admin-table">
            <thead><tr><th>Job</th><th>Típus</th><th>Utolsó futás</th><th className="num">Accountok</th><th className="num">Trade-ek</th><th>Státusz</th><th>Hiba</th></tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}>
                  <td style={{ color: "var(--ink-3)", fontSize: "0.68rem" }}>{j.id}</td>
                  <td style={{ fontFamily: "var(--font-data)", fontSize: "0.72rem" }}>{j.type}</td>
                  <td style={{ color: "var(--ink-3)", fontSize: "0.7rem" }}>{new Date(j.lastRun).toLocaleString("hu-HU")}</td>
                  <td className="num">{j.accounts}</td>
                  <td className="num">{j.trades}</td>
                  <td>
                    <span className={"badge badge--" + (j.status === "OK" ? "approved" : j.status === "WARN" ? "pending" : "rejected")}>
                      {j.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--negative)", fontSize: "0.7rem", maxWidth: 200 }}>{j.error ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="risk-bar" role="note">
          <strong>IB API + MT4/5 adapter:</strong> A szinkronizáció csak investor (read-only) hozzáférést használ. Clawback automatikusan aktiválódik, ha a broker visszavonja a CPA-t.
        </div>
      </div>
    </>
  );
}
