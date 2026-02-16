import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PublicProfilePage from './pages/PublicProfilePage';
import { useAuth } from './context/AuthContext';
import ThemeToggle from './components/ThemeToggle';

const App = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/achievements" element={<DashboardPage />} />
        <Route path="/u/:username" element={<PublicProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
