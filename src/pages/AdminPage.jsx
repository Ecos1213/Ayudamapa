import { useState } from 'react'
import { CheckCircle2, Clock3, Users, ShieldCheck, XCircle } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function AdminPage() {
  const { places, reviewPlace } = useApp()
  const { isAuthenticated, user, canVerify } = useAuth()
  const pending = places.filter(place => !place.verificado && place.revisionEstado !== 'resolved')
  const [busy, setBusy] = useState(null)

  async function review(id, approved) {
    setBusy(id)
    try { await reviewPlace(id, approved) } finally { setBusy(null) }
  }

  if (!isAuthenticated || !canVerify) return <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto text-slate-400" size={42}/><h2 className="mt-4 text-xl font-bold">Revisión de información</h2><p className="mt-2 text-sm text-slate-500">Esta sección está reservada para usuarios autorizados para revisar información.</p></div>

  return <div className="mx-auto max-w-7xl">
    <PageTitle title="Revisión de reportes" description="Los usuarios autorizados revisan y verifican la información ciudadana." />
    <div className="grid gap-4 md:grid-cols-3">
      <AdminStat icon={Clock3} label="Pendientes" value={pending.length} />
      <AdminStat icon={Users} label="Usuario actual" value={isAuthenticated ? (user?.display_name || 'Registrado') : 'Visitante'} />
      <AdminStat icon={ShieldCheck} label="Verificados" value={places.filter(p => p.verificado).length} />
    </div>

    {!isAuthenticated && <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900"><strong>Inicia sesión para revisar.</strong> Cualquier persona puede consultar y registrar información; la aprobación requiere una cuenta.</div>}

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5"><h3 className="font-bold">Información pendiente de revisión</h3></div>
      {pending.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No hay registros pendientes.</div> : <div className="divide-y divide-slate-100">
        {pending.map(place => <div key={place.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0"><p className="font-semibold">{place.nombre}</p><p className="mt-1 text-xs text-slate-500">{place.ciudad} · {place.departamento} · {place.reportadoPor}</p><p className="mt-2 text-sm text-slate-600">{place.necesidades.length} necesidad(es) registradas.</p></div>
          <div className="flex flex-wrap gap-2">{isAuthenticated ? <><button disabled={busy===place.id} onClick={()=>review(place.id,true)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"><CheckCircle2 size={15}/> Aprobar</button><button disabled={busy===place.id} onClick={()=>review(place.id,false)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"><XCircle size={15}/> Desaprobar</button></> : null}</div>
        </div>)}
      </div>}
    </section>
  </div>
}
function AdminStat({ icon: Icon, label, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="text-blue-700" size={21}/><p className="mt-4 text-sm text-slate-500">{label}</p><p className="mt-1 truncate text-2xl font-bold">{value}</p></div> }
