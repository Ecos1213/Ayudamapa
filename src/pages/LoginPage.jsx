import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = new URLSearchParams(location.search).get('returnTo') || location.state?.from || '/'
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError(err.message || 'No fue posible iniciar sesión.')
    } finally { setLoading(false) }
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:grid lg:place-items-center">
    <div className="w-full max-w-md">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={17}/> Volver al inicio</Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7"><div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#0f3d5e] text-white"><LogIn size={21}/></div><h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1><p className="mt-1 text-sm text-slate-500">Accede a las funciones de revisión de Ayudamapa.</p></div>
        {error && <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
        <form onSubmit={submit} className="space-y-5">
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Correo</span><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500" placeholder="correo@ejemplo.com"/></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Contraseña</span><input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500" placeholder="••••••••"/></label>
          <button disabled={loading} className="w-full rounded-xl bg-[#0f3d5e] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? 'Ingresando...' : 'Iniciar sesión'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">¿No tienes cuenta? <Link to="/registro" className="font-semibold text-blue-700">Registrarte</Link></p>
      </div>
    </div>
  </main>
}
