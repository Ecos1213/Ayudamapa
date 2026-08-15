import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LocateFixed, Plus, Trash2 } from 'lucide-react'
import { reportTypeLabels } from '../../data/mockPlaces'

const options = Object.entries(reportTypeLabels)
const emptyNeed = () => ({ id: `need-${Date.now()}-${Math.random().toString(36).slice(2)}`, item: '', cantidadRequerida: '', cantidadCubierta: '', unidad: 'unidades', estado: 'pendiente' })
const normalizeNeeds = (needs = []) => needs.map(n => ({ ...n, id: n.id || `need-${Date.now()}-${Math.random()}`, cantidadRequerida: n.cantidadRequerida ?? '', cantidadCubierta: n.cantidadCubierta ?? '', unidad: n.unidad || 'unidades', estado: n.estado || 'pendiente' }))

export default function ReportEditForm({ initialValues, onSubmit, submitLabel = 'Guardar cambios' }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ tipoReporte: initialValues.tipoReporte || initialValues.reportType || 'otra', nombre: initialValues.nombre || '', ciudad: initialValues.ciudad || '', departamento: initialValues.departamento || '', direccion: initialValues.direccion || '', lat: initialValues.lat ?? '', lng: initialValues.lng ?? '', descripcion: initialValues.descripcion || '', nivelUrgencia: initialValues.nivelUrgencia || 'media' })
  const [needs, setNeeds] = useState(() => normalizeNeeds(initialValues.necesidades))
  const [error, setError] = useState('')
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const updateNeed = (id, key, value) => setNeeds(current => current.map(n => n.id === id ? { ...n, [key]: value } : n))
  const addNeed = () => setNeeds(current => [...current, emptyNeed()])
  const removeNeed = id => setNeeds(current => current.filter(n => n.id !== id))
  const status = n => { const r = Number(n.cantidadRequerida) || 0; const c = Number(n.cantidadCubierta) || 0; return r > 0 && c >= r ? 'cubierta' : c > 0 ? 'parcial' : 'pendiente' }
  const locate = () => { if (!navigator.geolocation) return setError('Tu navegador no permite obtener la ubicación.') ; navigator.geolocation.getCurrentPosition(({ coords }) => { update('lat', coords.latitude.toFixed(6)); update('lng', coords.longitude.toFixed(6)) }, () => setError('No fue posible obtener tu ubicación. Puedes escribir una dirección.')) }
  const submit = event => {
    event.preventDefault(); setError('')
    if (!form.descripcion.trim()) return setError('Describe lo que está ocurriendo.')
    if (!form.direccion.trim() && (form.lat === '' || form.lng === '')) return setError('Indica una dirección o usa tu ubicación actual.')
    if (needs.some(n => !n.item.trim())) return setError('Todas las necesidades deben tener un nombre.')
    onSubmit({ ...form, recordKind: 'report', tipo: 'incidencia', tipoReporte: form.tipoReporte, lat: form.lat === '' ? '' : Number(form.lat), lng: form.lng === '' ? '' : Number(form.lng), necesidades: needs.map(n => ({ ...n, item: n.item.trim(), cantidadRequerida: Number(n.cantidadRequerida) || 0, cantidadCubierta: Math.min(Number(n.cantidadCubierta) || 0, Number(n.cantidadRequerida) || 0), estado: status(n) })) })
  }
  return <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Tipo de reporte" value={form.tipoReporte} onChange={v => update('tipoReporte', v)} select options={options} />
      <Field label="Referencia del lugar" value={form.nombre} onChange={v => update('nombre', v)} placeholder="Ej. Edificio de la calle 5" />
      <Field label="Ciudad" value={form.ciudad} onChange={v => update('ciudad', v)} placeholder="Cali" />
      <Field label="Departamento" value={form.departamento} onChange={v => update('departamento', v)} placeholder="Valle del Cauca" />
      <div className="sm:col-span-2"><Field label="Dirección" value={form.direccion} onChange={v => update('direccion', v)} placeholder="Calle, carrera o sector" /><button type="button" onClick={locate} className="mt-2 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"><LocateFixed size={15}/> Usar mi ubicación actual</button></div>
      <Field label="Latitud (opcional)" type="number" value={form.lat} onChange={v => update('lat', v)} placeholder="3.4516" />
      <Field label="Longitud (opcional)" type="number" value={form.lng} onChange={v => update('lng', v)} placeholder="-76.5320" />
      <Field label="Urgencia" value={form.nivelUrgencia} onChange={v => update('nivelUrgencia', v)} select options={[['alta','Alta'],['media','Media'],['baja','Baja'],['critica','Crítica']]} />
      <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Descripción</span><textarea rows="5" value={form.descripcion} onChange={e => update('descripcion', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></label>
    </div>

    <section className="mt-8 border-t border-slate-100 pt-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-lg font-bold">Necesidades del reporte</h3><p className="mt-1 text-sm text-slate-500">Puedes modificar, agregar o eliminar recursos necesarios.</p></div><button type="button" onClick={addNeed} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700"><Plus size={17}/>Agregar necesidad</button></div>
      {needs.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><p className="font-semibold">No hay necesidades registradas</p><button type="button" onClick={addNeed} className="mt-4 rounded-xl bg-[#0f3d5e] px-4 py-2.5 text-sm font-semibold text-white">+ Agregar primera necesidad</button></div> : <div className="mt-5 space-y-4">{needs.map((n, i) => <div key={n.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-bold">Necesidad #{i + 1}</p><button type="button" onClick={() => removeNeed(n.id)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600"><Trash2 size={15}/>Eliminar</button></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Field label="Necesidad" value={n.item} onChange={v => updateNeed(n.id, 'item', v)} placeholder="Agua, alimentos, palas..." wide /><Field label="Cantidad requerida" type="number" value={n.cantidadRequerida} onChange={v => updateNeed(n.id, 'cantidadRequerida', v)} /><Field label="Unidad" value={n.unidad} onChange={v => updateNeed(n.id, 'unidad', v)} select options={['unidades','litros','kilogramos','raciones','kits','cajas','pares','personas','otro'].map(v => [v, v])} /><Field label="Cantidad cubierta" type="number" value={n.cantidadCubierta} onChange={v => updateNeed(n.id, 'cantidadCubierta', v)} /><div><span className="mb-1.5 block text-sm font-semibold text-slate-700">Estado calculado</span><div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold">{status(n) === 'cubierta' ? '✓ Cubierta' : status(n) === 'parcial' ? '◐ Parcial' : '! Pendiente'}</div></div></div></div>)}</div>}
    </section>
    {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Cancelar</button><button className="rounded-xl bg-[#0f3d5e] px-5 py-2.5 text-sm font-semibold text-white">{submitLabel}</button></div>
  </form>
}

function Field({ label, value, onChange, placeholder = '', type = 'text', select = false, options = [], wide = false }) { return <label className={wide ? 'md:col-span-2' : ''}><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{select ? <select value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">{options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select> : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />}</label> }
