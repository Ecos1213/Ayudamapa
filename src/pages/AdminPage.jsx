import { CheckCircle2, Clock3, Users, ShieldCheck } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'

const reports = [
  { name: 'Albergue Comunitario El Poblado', reporter: 'Voluntarios Yumbo', time: 'Hace 2 h', status: 'Pendiente' },
  { name: 'Necesidad de medicamentos', reporter: 'Ciudadano', time: 'Hace 38 min', status: 'Pendiente' },
  { name: 'Cambio de acceso', reporter: 'Ciudadano', time: 'Hace 15 min', status: 'Pendiente' }
]

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle title="Administración" description="Supervisa reportes, usuarios y verificaciones." />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStat icon={Clock3} label="Reportes pendientes" value="3" />
        <AdminStat icon={Users} label="Usuarios activos" value="28" />
        <AdminStat icon={ShieldCheck} label="Entidades verificadas" value="7" />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5"><h3 className="font-bold">Reportes pendientes de revisión</h3></div>
        <div className="divide-y divide-slate-100">
          {reports.map(report => (
            <div key={report.name} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{report.name}</p>
                <p className="mt-1 text-xs text-slate-500">{report.reporter} · {report.time}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold">Revisar</button>
                <button className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"><CheckCircle2 className="mr-1 inline" size={14}/> Aprobar</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function AdminStat({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="text-blue-700" size={21}/><p className="mt-4 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>
}
