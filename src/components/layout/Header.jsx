import { Bell, Menu, UserCircle } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'Dashboard',
  '/lugares': 'Lugares',
  '/reportar': 'Reportar situación',
  '/reportes': 'Reportes',
  '/admin': 'Administración'
}

export default function Header() {
  const location = useLocation()
  const title = titles[location.pathname] || 'Detalle del lugar'

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 lg:hidden" aria-label="Abrir menú">
          <Menu size={20} />
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Coordinación</p>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200" aria-label="Notificaciones">
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <UserCircle size={32} className="text-slate-400" />
          <div className="text-sm">
            <p className="font-semibold">Coordinador</p>
            <p className="text-xs text-slate-400">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  )
}
