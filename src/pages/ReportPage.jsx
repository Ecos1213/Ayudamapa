import { useState } from 'react'
import { AlertTriangle, CheckCircle2, LocateFixed, MapPin, Plus, Trash2 } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'
import { createReport } from '../services/placesService'

const options = [
  ['persona_atrapada', 'Persona atrapada'],
  ['persona_desaparecida', 'Persona desaparecida'],
  ['persona_herida', 'Persona herida'],
  ['dano_estructural', 'Daño estructural'],
  ['via_bloqueada', 'Vía o acceso bloqueado'],
  ['emergencia_medica', 'Emergencia médica'],
  ['incendio', 'Incendio'],
  ['inundacion', 'Inundación'],
  ['necesidad', 'Necesidad urgente de recursos'],
  ['otra', 'Otra situación']
]

const initial = {
  tipoReporte: 'persona_atrapada',
  nombre: '',
  ciudad: 'Cali',
  departamento: 'Valle del Cauca',
  direccion: '',
  lat: '',
  lng: '',
  descripcion: '',
  nivelUrgencia: 'media',
}

const emptyNeed = () => ({
  id: `need-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  item: '',
  cantidadRequerida: '',
  cantidadCubierta: '',
  unidad: 'unidades',
  estado: 'pendiente',
})

function normalizeNeeds(needs = []) {
  return needs.map(n => ({
    ...n,
    id: n.id || `need-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    cantidadRequerida: n.cantidadRequerida ?? '',
    cantidadCubierta: n.cantidadCubierta ?? '',
    unidad: n.unidad || 'unidades',
    estado: n.estado || 'pendiente',
  }))
}

function needStatus(need) {
  const required = Number(need.cantidadRequerida) || 0
  const covered = Number(need.cantidadCubierta) || 0
  return required > 0 && covered >= required ? 'cubierta' : covered > 0 ? 'parcial' : 'pendiente'
}

export default function ReportPage() {
  const [form, setForm] = useState(initial)
  const [needs, setNeeds] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [locating, setLocating] = useState(false)
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const updateNeed = (id, key, value) => setNeeds(current => current.map(n => n.id === id ? { ...n, [key]: value } : n))
  const addNeed = () => setNeeds(current => [...current, emptyNeed()])
  const removeNeed = id => setNeeds(current => current.filter(n => n.id !== id))

  const locate = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no permite obtener la ubicación. Puedes escribir una dirección.')
      return
    }
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        update('lat', coords.latitude.toFixed(6))
        update('lng', coords.longitude.toFixed(6))
        setLocating(false)
      },
      () => {
        setLocating(false)
        setError('No fue posible obtener tu ubicación. Puedes escribir una dirección.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.descripcion.trim()) {
      setError('Describe lo que está ocurriendo.')
      return
    }
    if (!form.direccion.trim() && (!form.lat || !form.lng)) {
      setError('Indica una dirección o usa tu ubicación actual.')
      return
    }
    if (form.tipoReporte === 'necesidad') {
      if (needs.length === 0) {
        setError('Agrega al menos una necesidad requerida.')
        return
      }
      if (needs.some(n => !n.item.trim())) {
        setError('Todas las necesidades deben tener un nombre.')
        return
      }
      if (needs.some(n => (Number(n.cantidadRequerida) || 0) <= 0)) {
        setError('Todas las necesidades deben tener una cantidad requerida mayor que cero.')
        return
      }
    }

    try {
      await createReport({
        ...form,
        recordKind: 'report',
        tipo: 'incidencia',
        nivelUrgencia: ['persona_atrapada', 'emergencia_medica', 'incendio'].includes(form.tipoReporte) ? 'alta' : form.nivelUrgencia,
        nombre: form.nombre || options.find(([value]) => value === form.tipoReporte)?.[1] || 'Reporte ciudadano',
        necesidades: form.tipoReporte === 'necesidad' ? needs.map(n => ({
          ...n,
          item: n.item.trim(),
          cantidadRequerida: Number(n.cantidadRequerida) || 0,
          cantidadCubierta: Math.min(Number(n.cantidadCubierta) || 0, Number(n.cantidadRequerida) || 0),
          estado: needStatus(n),
        })) : [],
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'No se pudo enviar el reporte.')
    }
  }

  if (success) return <div className="mx-auto max-w-2xl py-12"><div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto text-emerald-600" size={52}/><h2 className="mt-4 text-2xl font-bold">Reporte recibido</h2><p className="mt-2 text-sm text-slate-500">Quedó registrado como <strong>no verificado</strong>. La información puede ser revisada posteriormente.</p><button onClick={() => { setForm(initial); setNeeds([]); setSuccess(false) }} className="mt-6 rounded-xl bg-[#0f3d5e] px-5 py-2.5 text-sm font-semibold text-white">Crear otro reporte</button></div></div>

  return <div className="mx-auto max-w-3xl">
    <PageTitle title="Reportar situación" description="Informa sobre un hecho, daño o necesidad que requiera atención. Para registrar un lugar permanente usa Nuevo lugar."/>
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800"><div className="flex gap-2"><AlertTriangle size={18} className="shrink-0"/><p>Los reportes quedan <strong>no verificados</strong> hasta que su información pueda ser revisada.</p></div></div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold">¿Qué está ocurriendo?</p>
        <div className="grid gap-3 sm:grid-cols-2">{options.map(([value, label]) => <label key={value} className={`cursor-pointer rounded-xl border p-4 text-sm font-semibold ${form.tipoReporte === value ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200'}`}><input type="radio" name="type" value={value} checked={form.tipoReporte === value} onChange={() => update('tipoReporte', value)} className="mr-2"/>{label}</label>)}</div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Referencia del lugar" value={form.nombre} onChange={value => update('nombre', value)} placeholder="Ej. Sector El Diamante"/>
        <Field label="Ciudad" value={form.ciudad} onChange={value => update('ciudad', value)} placeholder="Cali"/>
        <Field label="Departamento" value={form.departamento} onChange={value => update('departamento', value)} placeholder="Valle del Cauca"/>
        <div className="sm:col-span-2"><Field label="Dirección" value={form.direccion} onChange={value => update('direccion', value)} placeholder="Calle, carrera o sector"/><div className="mt-2 flex flex-wrap items-center gap-2"><button type="button" onClick={locate} disabled={locating} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-60"><LocateFixed size={15}/>{locating ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}</button>{form.lat && form.lng && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><MapPin size={14}/> Ubicación obtenida</span>}</div></div>
        <Field label="Latitud (opcional)" type="number" value={form.lat} onChange={value => update('lat', value)} placeholder="Ej. 3.4516"/>
        <Field label="Longitud (opcional)" type="number" value={form.lng} onChange={value => update('lng', value)} placeholder="Ej. -76.5320"/>

        {form.tipoReporte === 'necesidad' && <section className="sm:col-span-2 mt-2 border-t border-slate-100 pt-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-lg font-bold text-slate-900">Necesidades requeridas</h3><p className="mt-1 text-sm text-slate-500">Agrega todos los recursos que hagan falta. No hay una lista fija.</p></div><button type="button" onClick={addNeed} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700"><Plus size={17}/>Agregar necesidad</button></div>
          {needs.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><p className="font-semibold text-slate-700">No hay necesidades registradas</p><p className="mt-1 text-sm text-slate-500">Puedes agregar agua, alimentos, medicamentos, pañales, herramientas o cualquier otro recurso.</p><button type="button" onClick={addNeed} className="mt-4 rounded-xl bg-[#0f3d5e] px-4 py-2.5 text-sm font-semibold text-white">+ Agregar primera necesidad</button></div> : <div className="mt-5 space-y-4">{needs.map((n, i) => <div key={n.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-bold text-slate-800">Necesidad #{i + 1}</p><button type="button" onClick={() => removeNeed(n.id)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 size={15}/>Eliminar</button></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Field label="Necesidad" value={n.item} onChange={value => updateNeed(n.id, 'item', value)} placeholder="Ej. Mantas, agua, combustible, palas..." wide/><Field label="Cantidad requerida" type="number" value={n.cantidadRequerida} onChange={value => updateNeed(n.id, 'cantidadRequerida', value)} placeholder="0"/><Field label="Unidad" value={n.unidad} onChange={value => updateNeed(n.id, 'unidad', value)} select options={['unidades','litros','kilogramos','raciones','kits','cajas','pares','personas','otro'].map(v => [v, v])}/><Field label="Cantidad cubierta" type="number" value={n.cantidadCubierta} onChange={value => updateNeed(n.id, 'cantidadCubierta', value)} placeholder="0"/><div><span className="mb-1.5 block text-sm font-semibold text-slate-700">Estado calculado</span><div className="flex min-h-[42px] items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold">{needStatus(n) === 'cubierta' ? <span className="text-emerald-700">✓ Cubierta</span> : needStatus(n) === 'parcial' ? <span className="text-amber-700">◐ Parcial</span> : <span className="text-red-700">! Pendiente</span>}</div></div></div></div>)}</div>}
        </section>}

        <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold">Descripción</span><textarea required rows="5" value={form.descripcion} onChange={event => update('descripcion', event.target.value)} placeholder="Describe qué ocurre, cuántas personas podrían estar afectadas y cualquier dato útil..." className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"/></label>
      </div>
      {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
      <button className="mt-7 w-full rounded-xl bg-[#0f3d5e] px-5 py-3 text-sm font-semibold text-white">Enviar reporte</button>
    </form>
  </div>
}

function Field({ label, value, onChange, placeholder, type = 'text', select = false, options = [], wide = false }) {
  return <label className={wide ? 'lg:col-span-2' : ''}><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{select ? <select value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select> : <input type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"/>}</label>
}
