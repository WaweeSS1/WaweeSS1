import { useState } from "react";
import { useNavigate } from "react-router-dom";

type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

const SKILL_OPTIONS: { level: SkillLevel; name: string; desc: string }[] = [
  { level: "BEGINNER", name: "Kezdő", desc: "< 6 hónap kereskedési tapasztalat · guardrailek alapból aktívak" },
  { level: "INTERMEDIATE", name: "Haladó", desc: "6 hónap – 2 év · alapvető kockázatkezelési ismeretek" },
  { level: "ADVANCED", name: "Tapasztalt", desc: "> 2 év · önálló kockázatkezelés · minimális súrlódás" },
];

export function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [skill, setSkill] = useState<SkillLevel | null>(null);
  const [guardrailsOk, setGuardrailsOk] = useState(false);
  const navigate = useNavigate();

  function finish() {
    localStorage.setItem("fxking_onboarded", "1");
    localStorage.setItem("fxking_skill", skill ?? "BEGINNER");
    navigate("/wallet", { replace: true });
  }

  return (
    <div className="onboard-wrap">
      <div className="onboard-logo">FX<span>·</span>KING</div>

      {/* Step 1 — skill level */}
      {step === 1 && (
        <>
          <div className="onboard-step-label">01 / 03 · Profil</div>
          <h1 className="onboard-headline">Mi a tapasztalati szinted?</h1>
          <p className="onboard-sub">
            Ez meghatározza az alapértelmezett guardraileket (napi veszteséglimit, kalkulátor-kötelező stb.).
            Nem kő, bármikor módosítható.
          </p>
          <div className="skill-options">
            {SKILL_OPTIONS.map(o => (
              <button
                key={o.level}
                className={"skill-option" + (skill === o.level ? " selected" : "")}
                onClick={() => setSkill(o.level)}
                aria-pressed={skill === o.level}
              >
                <div className="skill-option__name">{o.name}</div>
                <div className="skill-option__desc">{o.desc}</div>
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary btn-full"
            disabled={!skill}
            onClick={() => setStep(2)}
          >
            Tovább →
          </button>
        </>
      )}

      {/* Step 2 — risk disclosure */}
      {step === 2 && (
        <>
          <div className="onboard-step-label">02 / 03 · Kockázati tájékoztató</div>
          <h1 className="onboard-headline">Mielőtt elindulsz</h1>
          <div className="risk-box" role="note" aria-label="Kockázati figyelmeztetés">
            <strong>KOCKÁZATI FIGYELMEZTETÉS</strong>
            A CFD-ek és forex kereskedés spekulatív termék. A kiskereskedelmi számlák nagy százaléka veszít pénzt.
            Az FX·King cash rebate-et kínál és trader eszközöket — nem befektetési tanácsot, nem profitgaranciát.
            Tools, not tips.
          </div>
          <div className="panel" style={{ marginBottom: "var(--sp-4)" }}>
            <div className="panel__body">
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-name">Elolvastam a kockázati tájékoztatót</span>
                  <span className="toggle-desc">kötelező a folytatáshoz</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={guardrailsOk}
                    onChange={e => setGuardrailsOk(e.target.checked)}
                    aria-label="Kockázati tájékoztató elfogadása"
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary btn-full"
            disabled={!guardrailsOk}
            onClick={() => setStep(3)}
          >
            Megértettem →
          </button>
          <button className="btn btn-outline btn-full" style={{ marginTop: "var(--sp-2)" }} onClick={() => setStep(1)}>
            ← Vissza
          </button>
        </>
      )}

      {/* Step 3 — connect broker */}
      {step === 3 && (
        <>
          <div className="onboard-step-label">03 / 03 · Broker összekapcsolás</div>
          <h1 className="onboard-headline">Kapcsold össze a broker-számlád</h1>
          <p className="onboard-sub">
            A rebate-ek automatikus számításához szükséges. Csak olvasási jog — kereskedési hozzáférés nem.
          </p>

          <div className="panel panel--accent" style={{ marginBottom: "var(--sp-3)" }}>
            <div className="panel__header">
              <span className="panel__label">IB API</span>
              <span className="badge badge--amber">Ajánlott</span>
            </div>
            <div className="panel__body">
              <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", marginBottom: "var(--sp-3)" }}>
                Interactive Brokers REST API kulcscsal — teljes auto-import.
              </p>
              <button className="btn btn-outline btn-sm">Csatlakozás IB API-val</button>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: "var(--sp-3)" }}>
            <div className="panel__header"><span className="panel__label">MT4 / MT5</span></div>
            <div className="panel__body">
              <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", marginBottom: "var(--sp-3)" }}>
                Investor jelszóval (read-only, nem kereskedési hozzáférés).
              </p>
              <button className="btn btn-outline btn-sm">Csatlakozás MT4/5-tel</button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={finish}
            style={{ marginTop: "var(--sp-3)" }}
          >
            Kész — megnyitom az appot →
          </button>
          <button
            className="btn btn-outline btn-full"
            style={{ marginTop: "var(--sp-2)", fontSize: "0.7rem" }}
            onClick={finish}
          >
            Kihagyom egyelőre (manuális import később)
          </button>
        </>
      )}
    </div>
  );
}
