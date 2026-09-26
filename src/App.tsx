import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import NewInvestmentModal from './components/NewInvestmentModal';
import OnboardingTour from './components/OnboardingTour';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import InvestorProfilePage from './pages/InvestorProfilePage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import HowItWorksPage from './pages/HowItWorksPage';
import InvestmentsPage from './pages/InvestmentsPage';
import BetPage from './pages/BetPage';
import MePage from './pages/MePage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function RedirectInvestor() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/investor/${id ?? ''}`} replace />;
}

function RedirectCreator() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/creator/${id ?? ''}`} replace />;
}

function AppContent() {
  const { showTutorial } = useAuth();

  return (
    <>
      <OnboardingTour />
      <NewInvestmentModal demoMode={showTutorial} tourActive={showTutorial} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/bet/:id" element={<BetPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/investor/:id" element={<InvestorProfilePage />} />
        <Route path="/creator/:id" element={<CreatorProfilePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/terms-of-use" element={<TermsOfUsePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/classement" element={<Navigate to="/leaderboard" replace />} />
        <Route path="/conditions-d-utilisation" element={<Navigate to="/terms-of-use" replace />} />
        <Route path="/politique-de-confidentialite" element={<Navigate to="/privacy-policy" replace />} />
        <Route path="/investisseur/:id" element={<RedirectInvestor />} />
        <Route path="/createur/:id" element={<RedirectCreator />} />
        <Route path="/comment-ca-marche" element={<Navigate to="/how-it-works" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
