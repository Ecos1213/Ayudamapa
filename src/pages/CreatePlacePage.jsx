import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTitle from '../components/common/PageTitle'
import PlaceForm from '../components/forms/PlaceForm'
import { useApp } from '../context/AppContext'

export default function CreatePlacePage() {
  const navigate = useNavigate()
  const { addPlace } = useApp()
  const [error, setError] = useState('')

  const submit = async (data) => {
    setError('')
    try {
      const place = await addPlace(data)
      navigate(`/lugares/${place.id}`)
    } catch (err) { setError(err.message || 'No se pudo registrar el lugar.') }
  }

  return <div className="mx-auto max-w-4xl">
    <PageTitle title="Registrar nuevo lugar" description="Crea un punto de emergencia para incorporarlo al sistema." />
    {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
    <PlaceForm onSubmit={submit} />
  </div>
}
