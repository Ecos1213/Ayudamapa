import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="mt-2 text-slate-500">La página no existe.</p>
      <Link to="/" className="mt-5 inline-block rounded-xl bg-[#0f3d5e] px-5 py-2.5 text-sm font-semibold text-white">Volver al dashboard</Link>
    </div>
  )
}
