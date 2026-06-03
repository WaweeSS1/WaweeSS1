import { useState } from "react";

type PayoutStatus = "PENDING" | "APPROVED" | "PAID" | "REJECTED";

interface Payout {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: "USDC_BEP20" | "BANK_TRANSFER";
  destination: string;
  status: PayoutStatus;
  requestedAt: string;
  txHash?: string;
}

const INITIAL: Payout[] = [
  { id: "PO-001", userId: "u1", username: "@trading_janos", amount: 120, method: "USDC_BEP20", destination: "0xA1b2...C3d4", status: "PENDING", requestedAt: "2024-06-03T10:00Z" },
  { id: "PO-002", userId: "u2", username: "@forex_kati",    amount: 80,  method: "BANK_TRANSFER", destination: "HU12 3456 7890", status: "PENDING", requestedAt: "2024-06-03T09:00Z" },
  { id: "PO-003", userId: "u3", username: "@peter_trader",  amount: 200, method: "USDC_BEP20", destination: "0xE5f6...G7h8", status: "APPROVED", requestedAt: "2024-06-02T14:00Z", txHash: "0xabc123...def456" },
];

export function Payouts() {
  const [payouts, setPayouts] = useState<Payout[]>(INITIAL);
  const [filter, setFilter] = useState<PayoutStatus | "ALL">("PENDING");
  const [txInput, setTxInput] = useState<Record<string, string>>({});

  function approve(id: string) {
    setPayouts(ps => ps.map(p => p.id === id ? { ...p, status: "APPROVED" } : p));
  }
  function reject(id: string) {
    setPayouts(ps => ps.map(p => p.id === id ? { ...p, status: "REJECTED" } : p));
  }
  function markPaid(id: string) {
    const tx = txInput[id] ?? "";
    setPayouts(ps => ps.map(p => p.id === id ? { ...p, status: "PAID", txHash: tx } : p));
  }

  const visible = filter === "ALL" ? payouts : payouts.filter(p => p.status === filter);
  const pendingCount = payouts.filter(p => p.status === "PENDING").length;

  return (
    <>
      <div className="admin-topbar">
        <span className="topbar-title">PAYOUT JÓVÁHAGYÁS</span>
        <div className="topbar-actions">
          {pendingCount > 0 && <span className="badge badge--pending">{pendingCount} pending</span>}
        </div>
      </div>
      <div className="admin-content">
        <div className="risk-bar" role="note">
          <strong>KÖTELEZŐ ELLENŐRZÉS:</strong> Jóváhagyás előtt verified a felhasználó egyenlege, a fraud flag státusza, és a cél-cím/IBAN. Clawback aktív CPA visszavonás esetén.
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
          {(["ALL","PENDING","APPROVED","PAID","REJECTED"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={"btn btn-outline btn-sm" + (filter === f ? " active" : "")}
              style={{ borderColor: filter === f ? "var(--amber)" : undefined, color: filter === f ? "var(--amber)" : undefined }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <span className="admin-table-title">Payout kérések</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: "0.6rem", color: "var(--ink-3)" }}>{visible.length} rekord</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Felhasználó</th><th>Módszer</th><th>Cél</th>
                <th className="num">Összeg</th><th>Státusz</th><th>TX / Ref</th><th>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(p => (
                <tr key={p.id}>
                  <td style={{ color: "var(--ink-3)", fontSize: "0.68rem" }}>{p.id}</td>
                  <td>{p.username}</td>
                  <td style={{ color: "var(--ink-3)", fontSize: "0.7rem" }}>{p.method === "USDC_BEP20" ? "USDC" : "Bank"}</td>
                  <td style={{ color: "var(--ink-3)", fontSize: "0.7rem", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>{p.destination}</td>
                  <td className="num amber">${p.amount}</td>
                  <td><span className={"badge badge--" + p.status.toLowerCase()}>{p.status}</span></td>
                  <td style={{ fontSize: "0.68rem" }}>
                    {p.status === "APPROVED" && (
                      <input
                        style={{ background: "var(--surface-hi)", border: "1px solid var(--border-strong)", color: "var(--ink)", fontFamily: "var(--font-data)", fontSize: "0.68rem", padding: "2px 6px", borderRadius: "2px", width: 100 }}
                        placeholder="0x..."
                        value={txInput[p.id] ?? ""}
                        onChange={e => setTxInput(prev => ({ ...prev, [p.id]: e.target.value }))}
                      />
                    )}
                    {p.txHash && <span style={{ color: "var(--ink-3)" }}>{p.txHash.slice(0, 14)}…</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "var(--sp-1)" }}>
                      {p.status === "PENDING" && (
                        <>
                          <button className="btn btn-approve btn-sm" onClick={() => approve(p.id)}>Jóváhagyás</button>
                          <button className="btn btn-reject btn-sm" onClick={() => reject(p.id)}>Elutasít</button>
                        </>
                      )}
                      {p.status === "APPROVED" && (
                        <button className="btn btn-primary btn-sm" onClick={() => markPaid(p.id)}>Kifizetve →</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--ink-3)", padding: "var(--sp-5)" }}>Nincs rekord</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
