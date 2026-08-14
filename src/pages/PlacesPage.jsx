import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'
import PlaceFilters from '../components/places/PlaceFilters'
import PlaceCard from '../components/places/PlaceCard'
import { useApp } from '../context/AppContext'

export default function PlacesPage() {
  const { places } = useApp()
  const [filters, setFilters] = useState({ search: '', tipo: '', estado: '', urgencia: '' })

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim()
    return places.filter(place => {
      const text = [
        place.nombre,
        place.ciudad,
        place.departamento,
        ...place.necesidades.map(n => n.item)
      ].join(' ').toLowerCase()

      return (!q || text.includes(q))
        && (!filters.tipo || place.tipo === filters.tipo)
        && (!filters.estado || place.estado === filters.estado)
        && (!filters.urgencia || place.nivelUrgencia === filters.urgencia)
    })
  }, [places, filters])

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        title="Lugares"
        description={`${filtered.length} lugares encontrados`}
        action={<Link to="/lugares/nuevo" className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d5e] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17} /> Nuevo lugar</Link>}
      />

      <PlaceFilters filters={filters} setFilters={setFilters} />

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(place => <PlaceCard key={place.id} place={place} />)}
      </div>

      {!filtered.length && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-semibold text-slate-700">No encontramos lugares</p>
          <p className="mt-1 text-sm text-slate-500">Prueba con otros filtros o términos de búsqueda.</p>
        </div>
      )}
    </div>
  )
}
