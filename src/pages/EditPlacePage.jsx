import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageTitle from '../components/common/PageTitle'
import PlaceForm from '../components/forms/PlaceForm'
import ReportEditForm from '../components/forms/ReportEditForm'
import { useApp } from '../context/AppContext'

export default function EditPlacePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { places, updatePlace } = useApp()
  const [error, setError] = useState('')
  const record = places.find(item => String(item.id) === String(id))

  if (!record) return <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="text-xl font-bold">Registro no encontrado</h2><Link className="mt-3 inline-block text-blue-700" to="/lugares">Volver a situación</Link></div>

  const submit = async (data) => {
    setError('')
    try { await updatePlace(id, data); navigate(`/lugares/${id}`) }
    catch (err) { setError(err.message || 'No se pudo actualizar la información.') }
  }

  const isReport = record.recordKind === 'report'
  return <div className="mx-auto max-w-4xl">
    <PageTitle title={isReport ? 'Editar reporte' : 'Editar información'} description="Al modificar cualquier dato, el registro vuelve a quedar pendiente de verificación." />
    {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Al guardar cambios, la información quedará nuevamente <strong>pendiente de verificación</strong>.</div>
    {isReport ? <ReportEditForm initialValues={record} onSubmit={submit} submitLabel="Guardar cambios" /> : <PlaceForm initialValues={record} onSubmit={submit} submitLabel="Guardar cambios" />}
  </div>
}
