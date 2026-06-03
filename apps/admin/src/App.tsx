import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import "./admin.css";
import { Dashboard } from "./pages/Dashboard";
import { Payouts } from "./pages/Payouts";
import { FraudReview } from "./pages/FraudReview";
import { Cohorts } from "./pages/Cohorts";
import { BrokerSync } from "./pages/BrokerSync";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        FX<span>·</span>KING
        <div className="sidebar__admin-label">Admin Console</div>
      </div>
      <nav className="sidebar__nav" aria-label="Admin navigáció">
        <div className="sidebar__section">Áttekintés</div>
        <NavLink to="/dashboard" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </NavLink>
        <NavLink to="/cohorts" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Cohort / LTV
        </NavLink>

        <div className="sidebar__section">Műveletek</div>
        <NavLink to="/payouts" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
          Payout jóváhagyás
        </NavLink>
        <NavLink to="/fraud" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Fraud review
        </NavLink>
        <NavLink to="/broker" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Broker sync
        </NavLink>
      </nav>
      <div className="sidebar__footer">
        Tools, not tips.<br />
        Jogi validáció: ESMA/MNB
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <div className="admin-shell">
      <Sidebar />
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/fraud" element={<FraudReview />} />
          <Route path="/cohorts" element={<Cohorts />} />
          <Route path="/broker" element={<BrokerSync />} />
        </Routes>
      </main>
    </div>
  );
}
