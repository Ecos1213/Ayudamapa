import { Outlet } from 'react-router-dom'
import { AppProvider } from '../../context/AppContext'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="lg:pl-64">
          <Header />
          <main className="px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AppProvider>
  )
}
