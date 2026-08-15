import { Search, SlidersHorizontal } from 'lucide-react'

const placeTypes = [
  ['albergue', 'Albergue / centro de acogida'],
  ['rescate', 'Zona de rescate'],
  ['acopio', 'Punto de acopio'],
  ['salud', 'Centro de salud'],
]

const reportTypes = [
  ['persona_atrapada', 'Persona atrapada'],
  ['persona_desaparecida', 'Persona desaparecida'],
  ['persona_herida', 'Persona herida'],
  ['dano_estructural', 'Daño estructural'],
  ['via_bloqueada', 'Vía o acceso bloqueado'],
  ['incendio', 'Incendio'],
  ['inundacion', 'Inundación'],
  ['emergencia_medica', 'Emergencia médica'],
  ['necesidad', 'Necesidad urgente de recursos'],
  ['otra', 'Otra situación'],
]

export default function PlaceFilters({ filters, setFilters }) {
  const update = (key, value) => setFilters(current => ({ ...current, [key]: value, ...(key === 'kind' ? { tipo: '', reportType: '' } : {}) }))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><SlidersHorizontal size={18} /> Buscar y filtrar</div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <label className="relative sm:col-span-2 xl:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={filters.search} onChange={e => update('search', e.target.value)} placeholder="Nombre, ciudad, necesidad o tipo..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white" />
        </label>

        <select value={filters.kind} onChange={e => update('kind', e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none">
          <option value="">Lugares y reportes</option><option value="place">Solo lugares</option><option value="report">Solo reportes</option>
        </select>

        {filters.kind !== 'report' && <select value={filters.tipo} onChange={e => update('tipo', e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"><option value="">Tipos de lugar</option>{placeTypes.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select>}
        {filters.kind !== 'place' && <select value={filters.reportType} onChange={e => update('reportType', e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"><option value="">Tipos de reporte</option>{reportTypes.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select>}

        <select value={filters.estado} onChange={e => update('estado', e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"><option value="">Todos los estados</option><option value="activo">Activo</option><option value="cerrado">Cerrado</option><option value="en_riesgo">En riesgo</option></select>
        <select value={filters.urgencia} onChange={e => update('urgencia', e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"><option value="">Toda urgencia</option><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option><option value="critica">Crítica</option></select>
        <select value={filters.verification} onChange={e => update('verification', e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"><option value="">Verificación</option><option value="unverified">No verificado</option><option value="verified">Verificado</option></select>
      </div>
    </div>
  )
}
