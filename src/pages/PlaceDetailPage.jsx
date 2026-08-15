import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit3, MapPin, Phone, Users, Clock, ShieldCheck, ShieldAlert, FileWarning, Building2 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import PageTitle from '../components/common/PageTitle'
import Badge from '../components/common/Badge'
import { useApp } from '../context/AppContext'
import { typeLabels, urgencyLabels, stateLabels, needStateLabels, reportTypeLabels } from '../data/mockPlaces'

const markerIcon = new L.Icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] })
function hasValidCoordinates(place) { const lat = place?.lat; const lng = place?.lng; return lat !== null && lat !== undefined && lat !== '' && lng !== null && lng !== undefined && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Number(lat) >= -90 && Number(lat) <= 90 && Number(lng) >= -180 && Number(lng) <= 180 }

export default function PlaceDetailPage() {
  const { id } = useParams()
  const { places } = useApp()
  const place = places.find(item => String(item.id) === String(id))
  if (!place) return <div className="mx-auto max-w-4xl py-20 text-center"><h2 className="text-xl font-bold">Registro no encontrado</h2><Link className="mt-3 inline-block text-blue-700" to="/lugares">Volver a situación</Link></div>
  const isReport = place.recordKind === 'report'
  const typeLabel = isReport ? (reportTypeLabels[place.reportType] || place.reportType || 'Reporte') : (typeLabels[place.placeType || place.tipo] || place.tipo)
  const editUrl = `/lugares/${place.id}/editar`

  return <div className="mx-auto max-w-7xl">
    <Link to="/lugares" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={17} /> Volver a situación</Link>
    <PageTitle title={place.nombre} description={`${isReport ? 'Reporte' : 'Lugar'} · ${typeLabel} · ${place.ciudad}, ${place.departamento}`} action={<Link to={editUrl} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><Edit3 size={17} /> Editar</Link>} />

    <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{isReport ? <FileWarning size={14}/> : <Building2 size={14}/>} {isReport ? 'Reporte' : 'Lugar'}</span><Badge value={place.nivelUrgencia} label={`Urgencia ${urgencyLabels[place.nivelUrgencia] || place.nivelUrgencia}`} /><Badge value={place.estado} label={stateLabels[place.estado] || place.estado} />{place.verificado ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><ShieldCheck size={16}/> Verificado</span> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><ShieldAlert size={16}/> Pendiente de verificación</span>}</div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info icon={isReport ? FileWarning : Building2} label={isReport ? 'Tipo de reporte' : 'Tipo de lugar'} value={typeLabel} />
            <Info icon={MapPin} label="Dirección" value={place.direccion || 'Sin dirección'} />
            {place.contacto && <Info icon={Phone} label="Contacto" value={place.contacto} />}
            {!isReport && <Info icon={Users} label="Capacidad" value={place.capacidad ? `${place.personasAtendidas} / ${place.capacidad}` : 'No aplica'} />}
            <Info icon={Clock} label="Última actualización" value={new Date(place.ultimaActualizacion).toLocaleString('es-CO')} />
          </div>
          {place.descripcion && <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Descripción</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{place.descripcion}</p></div>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5"><h3 className="font-bold">Necesidades actuales</h3></div>
          {place.necesidades.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Necesidad</th><th className="px-5 py-3">Requerida</th><th className="px-5 py-3">Cubierta</th><th className="px-5 py-3">Estado</th></tr></thead><tbody>{place.necesidades.map(need => <tr key={need.id} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold">{need.item}</td><td className="px-5 py-4">{need.cantidadRequerida} {need.unidad}</td><td className="px-5 py-4">{need.cantidadCubierta} {need.unidad}</td><td className="px-5 py-4"><Badge value={need.estado} label={needStateLabels[need.estado] || need.estado} /></td></tr>)}</tbody></table></div> : <div className="p-6 text-sm text-slate-500">No hay necesidades registradas.</div>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-bold">Estado de verificación</h3><p className="mt-2 text-sm text-slate-600">{place.verificado ? 'La información fue revisada y aparece como verificada.' : 'La información está pendiente de revisión. Si se modifica, volverá a quedar pendiente de verificación.'}</p></section>
      </div>

      <section className="min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{hasValidCoordinates(place) ? <MapContainer center={[Number(place.lat), Number(place.lng)]} zoom={14} scrollWheelZoom className="h-[480px]"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Marker position={[Number(place.lat), Number(place.lng)]} icon={markerIcon}><Popup>{typeLabel}: {place.nombre}</Popup></Marker></MapContainer> : <div className="flex h-full min-h-[320px] items-center justify-center p-8 text-center"><div><MapPin className="mx-auto text-slate-400" size={34}/><p className="mt-3 font-semibold text-slate-700">Ubicación en mapa no disponible</p><p className="mt-1 text-sm text-slate-500">Este registro tiene una dirección, pero no coordenadas GPS.</p></div></div>}</section>
    </div>
  </div>
}
function Info({ icon: Icon, label, value }) { return <div className="rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><Icon size={15}/>{label}</div><p className="mt-2 text-sm font-semibold text-slate-800">{value}</p></div> }
