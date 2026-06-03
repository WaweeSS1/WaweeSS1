import { NavLink } from "react-router-dom";

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigáció">
      <NavLink to="/wallet" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="2" y="6" width="20" height="14" rx="1"/>
          <path d="M16 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
          <path d="M2 10h20"/>
        </svg>
        <span className="nav-item__label">Tárca</span>
      </NavLink>

      <NavLink to="/journal" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="1"/>
          <path d="M7 8h10M7 12h10M7 16h6"/>
        </svg>
        <span className="nav-item__label">Napló</span>
      </NavLink>

      <NavLink to="/calc" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="4" y="2" width="16" height="20" rx="1"/>
          <rect x="7" y="5" width="10" height="4" rx="0.5"/>
          <circle cx="8" cy="14" r="1"/><circle cx="12" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>
          <circle cx="8" cy="18" r="1"/><circle cx="12" cy="18" r="1"/><circle cx="16" cy="18" r="1"/>
        </svg>
        <span className="nav-item__label">Kalkulátor</span>
      </NavLink>

      <NavLink to="/referral" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/>
          <path d="m8 13.5 8 4M8 10.5l8-4"/>
        </svg>
        <span className="nav-item__label">Referral</span>
      </NavLink>

      <NavLink to="/payout" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 3"/>
          <path d="M9 12h6" strokeLinecap="round"/>
          <path d="M12 16v3M12 5V2"/>
        </svg>
        <span className="nav-item__label">Payout</span>
      </NavLink>
    </nav>
  );
}
