import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./design/tokens.css";
import "./design/components.css";

import { BottomNav } from "./components/BottomNav";
import { OnboardingScreen } from "./screens/Onboarding";
import { WalletScreen } from "./screens/Wallet";
import { JournalScreen } from "./screens/Journal";
import { RiskCoachScreen } from "./screens/RiskCoach";
import { CalculatorScreen } from "./screens/Calculator";
import { ReferralScreen } from "./screens/Referral";
import { PayoutScreen } from "./screens/Payout";
import { initTelegramApp } from "./lib/telegram";

const ONBOARDED_KEY = "rebound_onboarded";

export default function App() {
  useEffect(() => {
    initTelegramApp();
  }, []);

  const isOnboarded = localStorage.getItem(ONBOARDED_KEY) === "1";

  return (
    <div id="app">
      <Routes>
        <Route
          path="/"
          element={isOnboarded ? <WalletScreen /> : <Navigate to="/onboarding" replace />}
        />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/wallet" element={<WalletScreen />} />
        <Route path="/journal" element={<JournalScreen />} />
        <Route path="/risk" element={<RiskCoachScreen />} />
        <Route path="/calc" element={<CalculatorScreen />} />
        <Route path="/referral" element={<ReferralScreen />} />
        <Route path="/payout" element={<PayoutScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isOnboarded && <BottomNav />}
    </div>
  );
}
