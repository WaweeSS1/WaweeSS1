import { useState } from "react";

const BALANCE = 282.40;
const MIN_PAYOUT = 20;

type Method = "USDC_BEP20" | "BANK_TRANSFER";
type Step = "form" | "confirm" | "pending";

const HISTORY = [
  { id: "1", amount: 80, method: "USDC_BEP20", status: "PAID",    tx: "0xabc...def", createdAt: "2024-05-28T11:00Z" },
  { id: "2", amount: 50, method: "BANK_TRANSFER", status: "PAID", tx: null,           createdAt: "2024-04-15T09:00Z" },
];

export function PayoutScreen() {
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState(80);
  const [method, setMethod] = useState<Method>("USDC_BEP20");
  const [wallet, setWallet] = useState("");
  const [iban, setIban] = useState("");
  const [holder, setHolder] = useState("");

  const canSubmit =
    amount >= MIN_PAYOUT &&
    amount <= BALANCE &&
    (method === "USDC_BEP20" ? wallet.length > 10 : iban.length > 10 && holder.length > 2);

  function submitRequest() {
    setStep("pending");
  }

  if (step === "pending") {
    return (
      <div className="screen page-pad">
        <div className="screen-header" style={{ padding: "var(--sp-3) 0 var(--sp-4)" }}>
          <div className="screen-title">PAYOUT</div>
        </div>
        <div className="panel panel--accent" style={{ textAlign: "center", padding: "var(--sp-7) var(--sp-4)" }}>
          <div className="panel__body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-4)" }}>
            <div className="readout__label">Kérés beküldve</div>
            <div className="readout__value amber">${amount.toFixed(2)}</div>
            <div className="readout__sub">FELDOLGOZÁS ALATT · 1-3 MUNKANAP</div>
            <div className="alert alert--ok" style={{ marginBottom: 0, maxWidth: 320, textAlign: "left" }}>
              ✓ A kérésed be lett rögzítve. Jóváhagyás után TX hash-t kapsz a tárca/bank adatokhoz.
            </div>
            <button className="btn btn-outline" onClick={() => setStep("form")}>← Vissza</button>
          </div>
        </div>
        <PayoutHistory />
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="screen page-pad">
        <div className="screen-header" style={{ padding: "var(--sp-3) 0 var(--sp-4)" }}>
          <div className="screen-title">PAYOUT MEGERŐSÍTÉSE</div>
        </div>
        <div className="panel panel--accent" style={{ marginBottom: "var(--sp-4)" }}>
          <div className="panel__header"><span className="panel__label">Összefoglaló</span></div>
          <div className="panel__body" style={{ padding: "0 var(--sp-3)" }}>
            <div className="panel__row">
              <span className="panel__row-label">Összeg</span>
              <span className="panel__row-value amber">${amount.toFixed(2)}</span>
            </div>
            <div className="panel__row">
              <span className="panel__row-label">Módszer</span>
              <span className="panel__row-value">{method === "USDC_BEP20" ? "USDC BEP-20" : "Banki átutalás"}</span>
            </div>
            {method === "USDC_BEP20" && (
              <div className="panel__row">
                <span className="panel__row-label">Tárca</span>
                <span className="panel__row-value" style={{ fontSize: "0.72rem", color: "var(--ink-2)" }}>
                  {wallet.slice(0, 8)}...{wallet.slice(-6)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="risk-box" role="note" style={{ marginBottom: "var(--sp-4)" }}>
          <strong>Ellenőrizd a tárca / IBAN adatokat!</strong>
          Hibás cím esetén az átutalás visszavonhatatlan lehet. Az Rebound nem vállal felelősséget.
        </div>
        <div style={{ display: "flex", gap: "var(--sp-3)" }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep("form")}>← Vissza</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitRequest}>
            Beküldés →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen page-pad">
      <div className="screen-header" style={{ padding: "var(--sp-3) 0 var(--sp-4)" }}>
        <div className="screen-title">PAYOUT KÉRÉS</div>
      </div>

      {/* Balance */}
      <div className="panel panel--accent" style={{ marginBottom: "var(--sp-4)" }}>
        <div className="panel__header">
          <span className="panel__label">Elérhető</span>
          <span className="badge badge--amber">CASH</span>
        </div>
        <div className="panel__body">
          <div className="readout">
            <div className="readout__value amber lg">${BALANCE.toFixed(2)}</div>
            <div className="readout__sub">USD · min. ${MIN_PAYOUT}</div>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="input-group">
        <label className="input-label" htmlFor="payout-amount">Összeg (USD)</label>
        <div className="input-prefix-wrap">
          <span className="input-prefix">$</span>
          <input
            id="payout-amount"
            type="number"
            className="input"
            min={MIN_PAYOUT}
            max={BALANCE}
            step={10}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
        </div>
        {amount < MIN_PAYOUT && <span style={{ fontFamily: "var(--font-data)", fontSize: "0.62rem", color: "var(--negative)" }}>Minimum ${MIN_PAYOUT}</span>}
      </div>

      {/* Method */}
      <div style={{ marginBottom: "var(--sp-4)" }}>
        <div className="input-label" style={{ marginBottom: "var(--sp-2)" }}>Módszer</div>

        <div className={"method-card" + (method === "USDC_BEP20" ? " selected" : "")} onClick={() => setMethod("USDC_BEP20")} role="radio" aria-checked={method === "USDC_BEP20"} tabIndex={0}>
          <div className="method-radio" /><div>
            <div className="method-name">USDC — BEP-20</div>
            <div className="method-desc">On-chain · TX hash-sel igazolt · 1-24h</div>
          </div>
        </div>

        <div className={"method-card" + (method === "BANK_TRANSFER" ? " selected" : "")} onClick={() => setMethod("BANK_TRANSFER")} role="radio" aria-checked={method === "BANK_TRANSFER"} tabIndex={0}>
          <div className="method-radio" /><div>
            <div className="method-name">Banki átutalás</div>
            <div className="method-desc">SEPA · 1-3 munkanap</div>
          </div>
        </div>
      </div>

      {/* Destination */}
      {method === "USDC_BEP20" && (
        <div className="input-group">
          <label className="input-label" htmlFor="wallet-addr">BEP-20 tárca cím</label>
          <input id="wallet-addr" type="text" className="input" placeholder="0x..."
            value={wallet} onChange={e => setWallet(e.target.value)} />
        </div>
      )}

      {method === "BANK_TRANSFER" && (
        <>
          <div className="input-group">
            <label className="input-label" htmlFor="iban">IBAN</label>
            <input id="iban" type="text" className="input" placeholder="HU00 0000 0000 0000 0000 0000 0000"
              value={iban} onChange={e => setIban(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="holder">Számlatulajdonos neve</label>
            <input id="holder" type="text" className="input" placeholder="Kovács János"
              value={holder} onChange={e => setHolder(e.target.value)} />
          </div>
        </>
      )}

      <button
        className="btn btn-primary btn-full"
        disabled={!canSubmit}
        onClick={() => setStep("confirm")}
        style={{ marginTop: "var(--sp-2)" }}
      >
        Folytatás →
      </button>

      <hr className="divider" />
      <PayoutHistory />
    </div>
  );
}

function PayoutHistory() {
  return (
    <div className="panel" style={{ marginTop: "var(--sp-4)" }}>
      <div className="panel__header"><span className="panel__label">Korábbi payoutok</span></div>
      {HISTORY.map(p => (
        <div key={p.id} className="panel__row">
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontFamily: "var(--font-data)", fontSize: "0.8rem", color: "var(--ink)" }}>
              ${p.amount} · {p.method === "USDC_BEP20" ? "USDC" : "Bank"}
            </span>
            {p.tx && (
              <span style={{ fontFamily: "var(--font-data)", fontSize: "0.6rem", color: "var(--ink-3)" }}>TX: {p.tx}</span>
            )}
            <span style={{ fontFamily: "var(--font-data)", fontSize: "0.6rem", color: "var(--ink-3)" }}>
              {new Date(p.createdAt).toLocaleDateString("hu-HU")}
            </span>
          </div>
          <span className="badge badge--success">{p.status}</span>
        </div>
      ))}
    </div>
  );
}
