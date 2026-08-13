import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { typeLabels, urgencyLabels } from '../../data/mockPlaces'

export default function EmergencyMap({ places }) {
  return (
    <div className="h-[430px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MapContainer center={[3.45, -76.50]} zoom={10} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map(place => (
          <CircleMarker
            key={place.id}
            center={[place.lat, place.lng]}
            radius={9}
            pathOptions={{
              color: place.nivelUrgencia === 'alta' ? '#dc2626' : place.nivelUrgencia === 'media' ? '#d97706' : '#16a34a',
              fillOpacity: 0.8
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <strong>{place.nombre}</strong>
                <p className="mt-1 text-sm">{typeLabels[place.tipo]} · {urgencyLabels[place.nivelUrgencia]}</p>
                <Link className="mt-2 inline-block text-sm font-semibold text-blue-700" to={`/lugares/${place.id}`}>
                  Ver detalle →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
