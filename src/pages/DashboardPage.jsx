import { Link } from 'react-router-dom'
import { Building2, HeartPulse, Package, AlertTriangle, ArrowRight } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'
import StatCard from '../components/common/StatCard'
import EmergencyMap from '../components/dashboard/EmergencyMap'
import PlaceCard from '../components/places/PlaceCard'
import { useApp } from '../context/AppContext'

export default function DashboardPage() {
  const { places, loading, error } = useApp()
  const active = places.filter(p => p.estado === 'activo')
  const urgent = places.filter(p => p.nivelUrgencia === 'alta')
  const people = places.reduce((sum, p) => sum + p.personasAtendidas, 0)

  const needs = places.flatMap(place =>
    place.necesidades.filter(n => n.estado !== 'cubierta').map(n => ({ ...n, place }))
  ).slice(0, 5)

  if (loading) return <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando información desde el servidor...</div>
  if (error && !places.length) return <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{error}</div>

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        title="Centro de coordinación"
        description="Vista general de la situación y recursos registrados."
        action={<Link to="/reportar" className="rounded-xl bg-[#0f3d5e] px-4 py-2.5 text-sm font-semibold text-white">+ Reportar situación</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Albergues activos" value={active.filter(p => p.tipo === 'albergue').length} description="Puntos de alojamiento" tone="blue" />
        <StatCard icon={HeartPulse} label="Centros de salud" value={active.filter(p => p.tipo === 'salud').length} description="Activos actualmente" tone="green" />
        <StatCard icon={AlertTriangle} label="Situaciones urgentes" value={urgent.length} description="Requieren atención" tone="red" />
        <StatCard icon={Package} label="Personas atendidas" value={people.toLocaleString('es-CO')} description="En todos los puntos" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Mapa de situación</h3>
            <Link to="/lugares" className="text-sm font-semibold text-blue-700">Ver todos</Link>
          </div>
          <EmergencyMap places={places} />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Necesidades prioritarias</h3>
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div className="space-y-3">
            {needs.map(need => (
              <Link key={`${need.place.id}-${need.id}`} to={`/lugares/${need.place.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{need.item}</p>
                    <p className="mt-1 text-xs text-slate-500">{need.place.nombre}</p>
                  </div>
                  <ArrowRight size={17} className="text-slate-400" />
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Faltan <strong>{Math.max(0, need.cantidadRequerida - need.cantidadCubierta)} {need.unidad}</strong>
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Registros recientes</h3>
          <Link to="/lugares" className="text-sm font-semibold text-blue-700">Ver todos</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {places.slice(0, 3).map(place => <PlaceCard key={place.id} place={place} />)}
        </div>
      </section>
    </div>
  )
}
