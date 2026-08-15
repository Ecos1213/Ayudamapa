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
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/registro" element={<RegisterPage />} />
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
}
