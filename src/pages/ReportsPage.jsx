import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import PageTitle from '../components/common/PageTitle'
import { useApp } from '../context/AppContext'

export default function ReportsPage() {
  const { places } = useApp()

  const exportCsv = () => {
    const headers = ['Nombre', 'Tipo', 'Ciudad', 'Departamento', 'Estado', 'Urgencia', 'Verificado']
    const rows = places.map(p => [p.nombre, p.tipo, p.ciudad, p.departamento, p.estado, p.nivelUrgencia, p.verificado ? 'Sí' : 'No'])
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lugares-emergencias.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle title="Reportes y exportación" description="Genera información resumida para coordinación." />

      <div className="grid gap-5 md:grid-cols-3">
        <ReportCard icon={FileSpreadsheet} title="Excel / CSV" text="Descarga los lugares registrados y sus estados." onClick={exportCsv} />
        <ReportCard icon={FileText} title="PDF ejecutivo" text="Preparar resumen ejecutivo para entidades." />
        <ReportCard icon={Download} title="Datos filtrados" text="Exportación basada en filtros seleccionados." />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold">Resumen ejecutivo</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Summary label="Lugares registrados" value={places.length} />
          <Summary label="Verificados" value={places.filter(p => p.verificado).length} />
          <Summary label="En riesgo" value={places.filter(p => p.estado === 'en_riesgo').length} />
          <Summary label="Urgencia alta" value={places.filter(p => p.nivelUrgencia === 'alta').length} />
        </div>
      </div>
    </div>
  )
}

function ReportCard({ icon: Icon, title, text, onClick }) {
  return (
    <button onClick={onClick} className="text-left rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon size={21}/></div>
      <h3 className="mt-5 font-bold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-blue-700">Generar →</span>
    </button>
  )
}

function Summary({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>
}
