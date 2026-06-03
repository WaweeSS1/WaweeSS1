import { useState } from "react";

const FLAGS = [
  { id: "F-001", user: "@anon_user1", signal: "DUPLICATE_IP",     detail: "5 signup ugyanarról az IP-ről (185.x.x.x)", reviewed: false, createdAt: "2024-06-03T08:00Z" },
  { id: "F-002", user: "@anon_user2", signal: "DUPLICATE_WALLET", detail: "BEP-20 cím már másik accounton", reviewed: false, createdAt: "2024-06-02T14:00Z" },
  { id: "F-003", user: "@legit_trade", signal: "SUSPICIOUS_VOLUME", detail: "3x átlag lot 24h-n belül — revenge check", reviewed: true, createdAt: "2024-06-01T09:00Z" },
];

export function FraudReview() {
  const [flags, setFlags] = useState(FLAGS);
  function resolve(id: string) { setFlags(fs => fs.map(f => f.id === id ? { ...f, reviewed: true } : f)); }

  return (
    <>
      <div className="admin-topbar">
        <span className="topbar-title">FRAUD REVIEW</span>
        <span className="badge badge--fraud">{flags.filter(f => !f.reviewed).length} nyitott</span>
      </div>
      <div className="admin-content">
        <div className="risk-bar" role="note">
          <strong>ANTI-FARM:</strong> Jutalom csak megerősített CPA után. Dedup: telefon / wallet / eszköz / IP. Clawback aktív.
        </div>
        <div className="admin-table-wrap">
          <div className="admin-table-header"><span className="admin-table-title">Fraud jelzők</span></div>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Felhasználó</th><th>Jelzés</th><th>Részlet</th><th>Dátum</th><th>Státusz</th><th>Művelet</th></tr></thead>
            <tbody>
              {flags.map(f => (
                <tr key={f.id}>
                  <td style={{ color: "var(--ink-3)", fontSize: "0.68rem" }}>{f.id}</td>
                  <td>{f.user}</td>
                  <td><span className="badge badge--fraud">{f.signal}</span></td>
                  <td style={{ color: "var(--ink-2)", fontSize: "0.75rem", maxWidth: 200 }}>{f.detail}</td>
                  <td style={{ color: "var(--ink-3)", fontSize: "0.7rem" }}>{new Date(f.createdAt).toLocaleDateString("hu-HU")}</td>
                  <td>{f.reviewed ? <span className="badge badge--neutral">Megvizsgálva</span> : <span className="badge badge--fraud">Nyitott</span>}</td>
                  <td>{!f.reviewed && <button className="btn btn-approve btn-sm" onClick={() => resolve(f.id)}>Lezárás</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
