import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initial = {
  nombre: '',
  tipo: 'albergue',
  ciudad: '',
  departamento: '',
  direccion: '',
  lat: '',
  lng: '',
  capacidad: '',
  personasAtendidas: '',
  contacto: '',
  estadoAcceso: 'Accesible',
  nivelUrgencia: 'media',
  estado: 'activo',
  necesidadesTexto: ''
}

export default function PlaceForm({ initialValues, onSubmit, submitLabel = 'Guardar lugar' }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialValues || initial)
  const [error, setError] = useState('')

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.nombre || !form.ciudad || !form.departamento) {
      setError('Completa nombre, ciudad y departamento.')
      return
    }

    const necesidades = (form.necesidadesTexto || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map((item, index) => ({
        id: Date.now() + index,
        item,
        cantidadRequerida: 0,
        cantidadCubierta: 0,
        unidad: 'unidades',
        estado: 'pendiente'
      }))

    onSubmit({
      ...form,
      lat: Number(form.lat) || 3.4516,
      lng: Number(form.lng) || -76.532,
      capacidad: Number(form.capacidad) || 0,
      personasAtendidas: Number(form.personasAtendidas) || 0,
      necesidades
    })
  }

  const input = (key, label, type = 'text', placeholder = '') => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={e => update(key, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
      />
    </label>
  )

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {error && <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid gap-5 md:grid-cols-2">
        {input('nombre', 'Nombre del lugar', 'text', 'Ej. Albergue San José')}
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Tipo</span>
          <select value={form.tipo} onChange={e => update('tipo', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="albergue">Albergue</option>
            <option value="rescate">Zona de rescate</option>
            <option value="acopio">Punto de acopio</option>
            <option value="salud">Centro de salud</option>
          </select>
        </label>

        {input('ciudad', 'Ciudad', 'text', 'Cali')}
        {input('departamento', 'Departamento', 'text', 'Valle del Cauca')}
        {input('direccion', 'Dirección', 'text', 'Calle / Carrera')}
        {input('contacto', 'Contacto', 'text', 'Teléfono')}
        {input('lat', 'Latitud', 'number', '3.4516')}
        {input('lng', 'Longitud', 'number', '-76.5320')}
        {input('capacidad', 'Capacidad', 'number', '200')}
        {input('personasAtendidas', 'Personas atendidas', 'number', '0')}

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Estado de acceso</span>
          <select value={form.estadoAcceso} onChange={e => update('estadoAcceso', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option>Accesible</option>
            <option>Vía parcialmente bloqueada</option>
            <option>Vía bloqueada</option>
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Nivel de urgencia</span>
          <select value={form.nivelUrgencia} onChange={e => update('nivelUrgencia', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Estado</span>
          <select value={form.estado} onChange={e => update('estado', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="activo">Activo</option>
            <option value="cerrado">Cerrado</option>
            <option value="en_riesgo">En riesgo</option>
          </select>
        </label>

        <label className="md:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Necesidades</span>
          <input
            value={form.necesidadesTexto}
            onChange={e => update('necesidadesTexto', e.target.value)}
            placeholder="Agua, alimentos, medicamentos..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <span className="mt-1 block text-xs text-slate-400">Sepáralas por comas.</span>
        </label>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
          Cancelar
        </button>
        <button className="rounded-xl bg-[#0f3d5e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b314b]">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
