import { Bell, Menu, UserCircle, X, LayoutDashboard, Map, PlusCircle, FileBarChart, ShieldCheck } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/lugares', label: 'Lugares', icon: Map },
  { to: '/reportar', label: 'Reportar', icon: PlusCircle },
  { to: '/reportes', label: 'Reportes', icon: FileBarChart },
  { to: '/admin', label: 'Administración', icon: ShieldCheck }
]

const titles = {
  '/': 'Dashboard',
  '/lugares': 'Lugares',
  '/reportar': 'Reportar situación',
  '/reportes': 'Reportes',
  '/admin': 'Administración'
}

export default function Header() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const title = titles[location.pathname] || 'Detalle del lugar'

  // Cierra el menú automáticamente al navegar, incluso cuando la ruta
  // cambia desde otro componente.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Permite cerrar el menú con Escape.
  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 lg:hidden"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
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

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          />

          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-[#0f3d5e] text-white shadow-2xl lg:hidden">
            <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
              <div>
                <p className="font-bold leading-tight">Emergencias</p>
                <p className="text-xs text-slate-300">Colombia</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {links.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-white text-[#0f3d5e]'
                        : 'text-slate-200 hover:bg-white/10'
                    }`
                  }
                >
                  <Icon size={19} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="m-4 rounded-2xl bg-white/10 p-4 text-xs text-slate-200">
              <p className="font-semibold text-white">Sistema de coordinación</p>
              <p className="mt-1">Prototipo frontend · datos locales</p>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
