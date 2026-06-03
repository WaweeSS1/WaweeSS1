import { Routes, Route } from "react-router-dom";
import { OnboardingScreen } from "./screens/Onboarding";
import { WalletScreen } from "./screens/Wallet";
import { JournalScreen } from "./screens/Journal";
import { RiskCoachScreen } from "./screens/RiskCoach";
import { CalculatorScreen } from "./screens/Calculator";
import { ReferralScreen } from "./screens/Referral";
import { PayoutScreen } from "./screens/Payout";
import { BottomNav } from "./components/BottomNav";

export default function App() {
  return (
    <div id="app">
      <Routes>
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/" element={<WalletScreen />} />
        <Route path="/journal" element={<JournalScreen />} />
        <Route path="/risk" element={<RiskCoachScreen />} />
        <Route path="/calc" element={<CalculatorScreen />} />
        <Route path="/referral" element={<ReferralScreen />} />
        <Route path="/payout" element={<PayoutScreen />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
