import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'
import PlaceFilters from '../components/places/PlaceFilters'
import PlaceCard from '../components/places/PlaceCard'
import { useApp } from '../context/AppContext'
import { reportTypeLabels, typeLabels } from '../data/mockPlaces'

export default function PlacesPage() {
  const { places } = useApp()
  const [filters, setFilters] = useState({ search: '', kind: '', tipo: '', reportType: '', estado: '', urgencia: '', verification: '' })

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim()
    return places.filter(record => {
      const typeText = record.recordKind === 'report'
        ? reportTypeLabels[record.reportType] || record.reportType || ''
        : typeLabels[record.placeType || record.tipo] || record.tipo || ''
      const text = [
        record.nombre, record.ciudad, record.departamento, record.direccion, typeText, record.descripcion,
        ...record.necesidades.map(n => n.item)
      ].join(' ').toLowerCase()

      return (!q || text.includes(q))
        && (!filters.kind || record.recordKind === filters.kind)
        && (!filters.tipo || record.placeType === filters.tipo)
        && (!filters.reportType || record.reportType === filters.reportType)
        && (!filters.estado || record.estado === filters.estado)
        && (!filters.urgencia || record.nivelUrgencia === filters.urgencia)
        && (!filters.verification || record.verificationStatus === filters.verification)
    })
  }, [places, filters])

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        title="Situación y registros"
        description={`${filtered.length} registros encontrados. Lugares y reportes se muestran juntos y se pueden filtrar desde aquí.`}
        action={<Link to="/lugares/nuevo" className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d5e] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17} /> Nuevo lugar</Link>}
      />

      <PlaceFilters filters={filters} setFilters={setFilters} />

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(record => <PlaceCard key={record.id} place={record} />)}
      </div>

      {!filtered.length && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-semibold text-slate-700">No encontramos registros</p>
          <p className="mt-1 text-sm text-slate-500">Prueba con otros filtros o términos de búsqueda.</p>
        </div>
      )}
    </div>
  )
}
