import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Users, Clock, ShieldCheck, ShieldAlert, FileWarning, Building2 } from 'lucide-react'
import Badge from '../common/Badge'
import { typeLabels, urgencyLabels, stateLabels, reportTypeLabels } from '../../data/mockPlaces'

function timeAgo(date) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000))
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  return `hace ${Math.floor(hours / 24)} d`
}

export default function PlaceCard({ place }) {
  const { isAuthenticated } = useAuth()
  const isReport = place.recordKind === 'report'
  const typeLabel = isReport ? (reportTypeLabels[place.reportType] || place.reportType || 'Reporte') : (typeLabels[place.placeType || place.tipo] || place.tipo)
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isReport ? <FileWarning size={17} className="text-orange-600" /> : <Building2 size={17} className="text-blue-700" />}
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{isReport ? 'Reporte' : 'Lugar'}</p>
          </div>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{typeLabel}</h3>
          <p className="mt-0.5 truncate text-sm font-medium text-slate-600">{place.nombre}</p>
        </div>
        <Badge value={place.nivelUrgencia} label={urgencyLabels[place.nivelUrgencia] || place.nivelUrgencia} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="flex gap-2"><MapPin size={17} className="shrink-0" />{place.direccion || `${place.ciudad}, ${place.departamento}`}</p>
        {!isReport && place.capacidad > 0 && <p className="flex gap-2"><Users size={17} className="shrink-0" />{place.personasAtendidas} / {place.capacidad} personas</p>}
        <p className="flex gap-2"><Clock size={17} className="shrink-0" />Actualizado {timeAgo(place.ultimaActualizacion)}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge value={place.estado} label={stateLabels[place.estado] || place.estado} />
        {place.verificado ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><ShieldCheck size={15} /> Verificado</span> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><ShieldAlert size={15} /> Pendiente de verificación</span>}
      </div>

      {place.necesidades?.length > 0 && <p className="mt-3 text-xs font-medium text-slate-500">{place.necesidades.length} necesidad(es) registradas</p>}

      <Link to={`/lugares/${place.id}/editar`} className="mt-3 block rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700">Editar información</Link>
      <Link to={`/lugares/${place.id}`} className="mt-3 block rounded-xl bg-[#0f3d5e] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0b314b]">Ver detalles</Link>
    </article>
  )
}
