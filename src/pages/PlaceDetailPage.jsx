import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit3, MapPin, Phone, Users, Clock, ShieldCheck, ShieldAlert } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import PageTitle from '../components/common/PageTitle'
import Badge from '../components/common/Badge'
import { useApp } from '../context/AppContext'
import { typeLabels, urgencyLabels, stateLabels, needStateLabels } from '../data/mockPlaces'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

export default function PlaceDetailPage() {
  const { id } = useParams()
  const { places } = useApp()
  const place = places.find(item => item.id === id)

  if (!place) return <div className="mx-auto max-w-4xl py-20 text-center"><h2 className="text-xl font-bold">Lugar no encontrado</h2><Link className="mt-3 inline-block text-blue-700" to="/lugares">Volver</Link></div>

  return (
    <div className="mx-auto max-w-7xl">
      <Link to="/lugares" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft size={17} /> Volver a lugares
      </Link>

      <PageTitle
        title={place.nombre}
        description={`${typeLabels[place.tipo]} · ${place.ciudad}, ${place.departamento}`}
        action={<Link to={`/lugares/${place.id}/editar`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><Edit3 size={17} /> Editar</Link>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={place.nivelUrgencia} label={`Urgencia ${urgencyLabels[place.nivelUrgencia]}`} />
              <Badge value={place.estado} label={stateLabels[place.estado]} />
              {place.verificado ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><ShieldCheck size={16}/> Verificado</span> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><ShieldAlert size={16}/> No verificado</span>}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info icon={MapPin} label="Dirección" value={place.direccion || 'Sin dirección'} />
              <Info icon={Phone} label="Contacto" value={place.contacto || 'Sin contacto'} />
              <Info icon={Users} label="Capacidad" value={place.capacidad ? `${place.personasAtendidas} / ${place.capacidad}` : 'No aplica'} />
              <Info icon={Clock} label="Última actualización" value={new Date(place.ultimaActualizacion).toLocaleString('es-CO')} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h3 className="font-bold">Necesidades actuales</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="px-5 py-3">Necesidad</th><th className="px-5 py-3">Requerida</th><th className="px-5 py-3">Cubierta</th><th className="px-5 py-3">Estado</th></tr>
                </thead>
                <tbody>
                  {place.necesidades.map(need => (
                    <tr key={need.id} className="border-t border-slate-100">
                      <td className="px-5 py-4 font-semibold">{need.item}</td>
                      <td className="px-5 py-4">{need.cantidadRequerida} {need.unidad}</td>
                      <td className="px-5 py-4">{need.cantidadCubierta} {need.unidad}</td>
                      <td className="px-5 py-4"><Badge value={need.estado} label={needStateLabels[need.estado]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold">Auditoría</h3>
            <div className="mt-4 text-sm text-slate-600">
              <p><strong>Reportado por:</strong> {place.reportadoPor}</p>
              <p className="mt-2"><strong>Verificación:</strong> {place.verificado ? 'Confirmado por entidad / coordinador' : 'Pendiente de revisión'}</p>
            </div>
          </section>
        </div>

        <section className="h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MapContainer center={[place.lat, place.lng]} zoom={14} scrollWheelZoom>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[place.lat, place.lng]} icon={markerIcon}>
              <Popup>{place.nombre}</Popup>
            </Marker>
          </MapContainer>
        </section>
      </div>
    </div>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><Icon size={15}/>{label}</div>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}
