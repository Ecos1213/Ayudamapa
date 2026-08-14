import { useState } from 'react'
import { CheckCircle2, MapPin, AlertTriangle } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'

export default function ReportPage() {
  const [sent, setSent] = useState(false)
  const [type, setType] = useState('nuevo_lugar')

  if (sent) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto text-emerald-600" size={52} />
          <h2 className="mt-4 text-2xl font-bold">Reporte recibido</h2>
          <p className="mt-2 text-sm text-slate-500">Tu reporte quedó como <strong>no verificado</strong> y será revisado por un coordinador o entidad autorizada.</p>
          <button onClick={() => setSent(false)} className="mt-6 rounded-xl bg-[#0f3d5e] px-5 py-2.5 text-sm font-semibold text-white">Crear otro reporte</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Reportar situación" description="Formulario rápido para reportar información desde el terreno." />

      <form onSubmit={e => { e.preventDefault(); setSent(true) }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex gap-2"><AlertTriangle size={18} className="shrink-0" /><p>Los reportes ciudadanos aparecen como no verificados hasta que una persona autorizada los revise.</p></div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold">¿Qué quieres reportar?</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['nuevo_lugar', 'Nuevo lugar'],
              ['necesidad', 'Necesidad'],
              ['estado', 'Cambio de estado']
            ].map(([value, label]) => (
              <label key={value} className={`rounded-xl border p-4 text-sm font-semibold ${type === value ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200'}`}>
                <input type="radio" name="type" value={value} checked={type === value} onChange={() => setType(value)} className="mr-2" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Nombre del lugar" placeholder="Ej. Albergue San José" />
          <Field label="Ciudad" placeholder="Cali" />
          <Field label="Departamento" placeholder="Valle del Cauca" />
          <Field label="Contacto" placeholder="Opcional" />
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold">Ubicación</span>
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              <MapPin size={18} /> Usar mi ubicación
            </button>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold">Descripción</span>
            <textarea rows="4" placeholder="Describe brevemente la situación..." className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
          </label>
        </div>

        <button className="mt-7 w-full rounded-xl bg-[#0f3d5e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0b314b]">
          Enviar reporte
        </button>
      </form>
    </div>
  )
}

function Field({ label, placeholder }) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <input placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
    </label>
  )
}
