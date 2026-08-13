import { Search, SlidersHorizontal } from 'lucide-react'

export default function PlaceFilters({ filters, setFilters }) {
  const update = (key, value) => setFilters(current => ({ ...current, [key]: value }))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <SlidersHorizontal size={18} />
        Buscar y filtrar
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={filters.search}
            onChange={e => update('search', e.target.value)}
            placeholder="Nombre, ciudad o necesidad..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
          />
        </label>

        <select value={filters.tipo} onChange={e => update('tipo', e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none">
          <option value="">Todos los tipos</option>
          <option value="albergue">Albergue</option>
          <option value="rescate">Rescate</option>
          <option value="acopio">Acopio</option>
          <option value="salud">Salud</option>
        </select>

        <select value={filters.estado} onChange={e => update('estado', e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="cerrado">Cerrado</option>
          <option value="en_riesgo">En riesgo</option>
        </select>

        <select value={filters.urgencia} onChange={e => update('urgencia', e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none">
          <option value="">Toda urgencia</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>
    </div>
  )
}
