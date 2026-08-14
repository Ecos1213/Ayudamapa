import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './app/components/ProtectedRoute';
import LoginPage from './app/pages/LoginPage';
import SignupPage from './app/pages/SignupPage';
import VerifyEmailPage from './app/pages/VerifyEmailPage';
import ForgotPasswordPage from './app/pages/ForgotPasswordPage';
import ProfilePage from './app/pages/ProfilePage';
import MapPage from './app/pages/MapPage';
import Index from './app/containers/Index';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<Index />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
