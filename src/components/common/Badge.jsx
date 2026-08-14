const variants = {
  alta: 'bg-red-50 text-red-700 ring-red-200',
  media: 'bg-amber-50 text-amber-700 ring-amber-200',
  baja: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  activo: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cerrado: 'bg-slate-100 text-slate-600 ring-slate-200',
  en_riesgo: 'bg-orange-50 text-orange-700 ring-orange-200',
  cubierta: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  parcial: 'bg-amber-50 text-amber-700 ring-amber-200',
  pendiente: 'bg-red-50 text-red-700 ring-red-200',
  verificado: 'bg-blue-50 text-blue-700 ring-blue-200',
  no_verificado: 'bg-slate-100 text-slate-600 ring-slate-200'
}

export default function Badge({ value, label }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${variants[value] || variants.no_verificado}`}>
      {label || value}
    </span>
  )
}
