import { useNavigate } from 'react-router-dom'
import PageTitle from '../components/common/PageTitle'
import PlaceForm from '../components/forms/PlaceForm'
import { useApp } from '../context/AppContext'

export default function CreatePlacePage() {
  const navigate = useNavigate()
  const { addPlace } = useApp()

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title="Registrar nuevo lugar" description="Crea un punto de emergencia para incorporarlo al sistema." />
      <PlaceForm onSubmit={(data) => { const place = addPlace(data); navigate(`/lugares/${place.id}`) }} />
    </div>
  )
}
