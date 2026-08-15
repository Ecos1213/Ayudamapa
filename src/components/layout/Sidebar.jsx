import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, PlusCircle, FileBarChart, ShieldCheck, Siren } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/lugares', label: 'Situación', icon: Map },
  { to: '/reportar', label: 'Reportar', icon: PlusCircle },
  { to: '/reportes', label: 'Reportes', icon: FileBarChart },
  { to: '/admin', label: 'Administración', icon: ShieldCheck }
]

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#0f3d5e] text-white lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
          <Siren size={22} />
        </div>
        <div>
          <p className="font-bold leading-tight">Emergencias</p>
          <p className="text-xs text-slate-300">Colombia</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-white text-[#0f3d5e]' : 'text-slate-200 hover:bg-white/10'
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
        <p className="mt-1">Coordinación de emergencias</p>
      </div>
    </aside>
  )
}
