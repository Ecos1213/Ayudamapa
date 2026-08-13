import { Link } from 'react-router-dom'
import { MapPin, Users, Clock, ShieldCheck, ShieldAlert } from 'lucide-react'
import Badge from '../common/Badge'
import { typeLabels, urgencyLabels, stateLabels } from '../../data/mockPlaces'

function timeAgo(date) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000))
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  return `hace ${Math.floor(hours / 24)} d`
}

export default function PlaceCard({ place }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{typeLabels[place.tipo]}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{place.nombre}</h3>
        </div>
        <Badge value={place.nivelUrgencia} label={urgencyLabels[place.nivelUrgencia]} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="flex gap-2"><MapPin size={17} className="shrink-0" />{place.ciudad}, {place.departamento}</p>
        {place.capacidad > 0 && (
          <p className="flex gap-2"><Users size={17} className="shrink-0" />{place.personasAtendidas} / {place.capacidad} personas</p>
        )}
        <p className="flex gap-2"><Clock size={17} className="shrink-0" />Actualizado {timeAgo(place.ultimaActualizacion)}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge value={place.estado} label={stateLabels[place.estado]} />
        {place.verificado
          ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><ShieldCheck size={15} /> Verificado</span>
          : <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><ShieldAlert size={15} /> No verificado</span>}
      </div>

      <Link
        to={`/lugares/${place.id}`}
        className="mt-5 block rounded-xl bg-[#0f3d5e] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0b314b]"
      >
        Ver detalles
      </Link>
    </article>
  )
}
