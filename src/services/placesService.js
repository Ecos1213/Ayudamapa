import { apiClient } from './apiClient'

const typeToApi = {
  albergue: 'shelter',
  rescate: 'rescue',
  acopio: 'supply_point',
  salud: 'health',
  incidencia: 'incident',
}

const typeFromApi = {
  shelter: 'albergue',
  rescue: 'rescate',
  supply_point: 'acopio',
  health: 'salud',
  incident: 'incidencia',
  damage: 'incidencia',
  supply_request: 'incidencia',
  help_needed: 'incidencia',
}

const severityToApi = { baja: 'low', media: 'medium', alta: 'high', critica: 'critical' }
const severityFromApi = { low: 'baja', medium: 'media', high: 'alta', critical: 'critica' }

function mapPin(pin) {
  const metadata = pin.metadata || {}
  const needs = Array.isArray(metadata.necesidades) ? metadata.necesidades : []
  const recordKind = pin.record_kind || (metadata.tipoReporte ? 'report' : 'place')
  return {
    ...metadata,
    id: pin.id,
    recordKind,
    placeType: pin.place_type || (recordKind === 'place' ? (metadata.tipo || typeFromApi[pin.type] || 'incidencia') : null),
    reportType: pin.report_type || metadata.tipoReporte || null,
    nombre: metadata.nombre || pin.description || 'Registro sin nombre',
    tipo: recordKind === 'report' ? 'incidencia' : (metadata.tipo || pin.place_type || typeFromApi[pin.type] || 'incidencia'),
    tipoReporte: pin.report_type || metadata.tipoReporte || '',
    ciudad: metadata.ciudad || '',
    departamento: metadata.departamento || '',
    direccion: metadata.direccion || '',
    lat: metadata.lat !== undefined && metadata.lat !== '' && metadata.lat !== null ? Number(metadata.lat) : (pin.location?.lat ?? null),
    lng: metadata.lng !== undefined && metadata.lng !== '' && metadata.lng !== null ? Number(metadata.lng) : (pin.location?.lng ?? null),
    capacidad: Number(metadata.capacidad || 0),
    personasAtendidas: Number(metadata.personasAtendidas || 0),
    contacto: metadata.contacto || '',
    estadoAcceso: metadata.estadoAcceso || 'Accesible',
    nivelUrgencia: metadata.nivelUrgencia || severityFromApi[pin.severity] || 'media',
    estado: metadata.estado || 'activo',
    ultimaActualizacion: pin.updated_at || pin.created_at,
    reportadoPor: metadata.reportadoPor || 'Ciudadano',
    verificado: pin.verification_status === 'verified' || Boolean(pin.verified_by),
    verificationStatus: pin.verification_status || 'unverified',
    creatorId: pin.creator_id || null,
    necesidades: needs,
    revisionEstado: pin.status,
  }
}

export function toPinPayload(place) {
  const isReport = place.recordKind === 'report' || Boolean(place.tipoReporte)
  const description = [place.nombre, place.descripcion].filter(Boolean).join(' — ')
  return {
    record_kind: isReport ? 'report' : 'place',
    place_type: isReport ? null : (typeToApi[place.tipo] || 'incident'),
    report_type: isReport ? (place.tipoReporte || 'otra') : null,
    location: place.lat !== '' && place.lat !== null && place.lat !== undefined && place.lng !== '' && place.lng !== null && place.lng !== undefined && Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lng)) ? { lat: Number(place.lat), lng: Number(place.lng) } : null,
    type: isReport ? 'incident' : (typeToApi[place.tipo] || 'incident'),
    severity: severityToApi[place.nivelUrgencia] || 'medium',
    description,
    metadata: (() => { const metadata = { ...place }; if (!isReport) delete metadata.tipoReporte; return metadata })(),
    is_private: false,
  }
}

export async function listPlaces(params = {}) {
  const query = new URLSearchParams(params).toString()
  const data = await apiClient.get(`/api/pins${query ? `?${query}` : ''}`)
  return (data.pins || []).map(mapPin)
}

export async function getPlace(id) {
  const data = await apiClient.get(`/api/pins/${id}`)
  return mapPin(data.pin)
}

export async function createPlace(place) {
  const data = await apiClient.post('/api/pins', toPinPayload(place))
  return mapPin(data.pin)
}

export async function updatePlace(id, place) {
  const hasCoordinates = place.lat !== '' && place.lat !== null && place.lat !== undefined && place.lng !== '' && place.lng !== null && place.lng !== undefined && Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lng))
  const isReport = place.recordKind === 'report' || Boolean(place.tipoReporte)
  const data = await apiClient.patch(`/api/pins/${id}`, {
    record_kind: isReport ? 'report' : 'place',
    place_type: isReport ? null : (typeToApi[place.tipo] || 'incident'),
    report_type: isReport ? (place.tipoReporte || 'otra') : null,
    location: hasCoordinates ? { lat: Number(place.lat), lng: Number(place.lng) } : null,
    type: isReport ? 'incident' : (typeToApi[place.tipo] || 'incident'),
    description: [place.nombre, place.descripcion].filter(Boolean).join(' — '),
    severity: severityToApi[place.nivelUrgencia] || 'medium',
    metadata: (() => { const metadata = { ...place }; if (!isReport) delete metadata.tipoReporte; return metadata })(),
  })
  return mapPin(data.pin)
}

export async function reviewPlace(id, approved) {
  const data = await apiClient.patch(`/api/pins/${id}/review`, { approved })
  return mapPin(data.pin)
}

export async function createReport(report) {
  const payload = {
    ...report,
    recordKind: 'report',
    tipo: 'incidencia',
    nivelUrgencia: report.nivelUrgencia || 'media',
    nombre: report.nombre || report.tipoReporte || 'Reporte ciudadano',
    necesidades: report.necesidades || [],
  }
  const data = await apiClient.post('/api/pins', toPinPayload(payload))
  return mapPin(data.pin)
}

export { mapPin }
