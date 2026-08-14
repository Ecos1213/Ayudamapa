<<<<<<< HEAD
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
=======
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import PlacesPage from './pages/PlacesPage'
import PlaceDetailPage from './pages/PlaceDetailPage'
import CreatePlacePage from './pages/CreatePlacePage'
import EditPlacePage from './pages/EditPlacePage'
import ReportPage from './pages/ReportPage'
import ReportsPage from './pages/ReportsPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/lugares" element={<PlacesPage />} />
        <Route path="/lugares/nuevo" element={<CreatePlacePage />} />
        <Route path="/lugares/:id" element={<PlaceDetailPage />} />
        <Route path="/lugares/:id/editar" element={<EditPlacePage />} />
        <Route path="/reportar" element={<ReportPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
>>>>>>> 94fa38c0bd2bbb26c945be08427660a5739d64c4
