import { useState } from 'react'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ displayName:'', email:'', password:'', confirm:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try {
      await register(form.email, form.password, form.displayName)
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) { setError(err.message || 'No fue posible crear la cuenta.') }
    finally { setLoading(false) }
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:grid lg:place-items-center">
    <div className="w-full max-w-md">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={17}/> Volver al inicio</Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7"><div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#0f3d5e] text-white"><UserPlus size={21}/></div><h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1><p className="mt-1 text-sm text-slate-500">La cuenta es opcional para consultar y registrar información.</p></div>
        {error && <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
        <form onSubmit={submit} className="space-y-5">
          <Field label="Nombre" value={form.displayName} onChange={v=>update('displayName',v)} required />
          <Field label="Correo" type="email" value={form.email} onChange={v=>update('email',v)} required />
          <Field label="Contraseña" type="password" value={form.password} onChange={v=>update('password',v)} required />
          <Field label="Confirmar contraseña" type="password" value={form.confirm} onChange={v=>update('confirm',v)} required />
          <button disabled={loading} className="w-full rounded-xl bg-[#0f3d5e] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? 'Creando...' : 'Crear cuenta'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-blue-700">Iniciar sesión</Link></p>
      </div>
    </div>
  </main>
}
function Field({ label, value, onChange, type='text', required=false }) { return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><input required={required} type={type} value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"/></label> }
