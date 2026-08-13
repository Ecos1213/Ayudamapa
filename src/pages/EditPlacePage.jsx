import { useNavigate, useParams } from 'react-router-dom'
import PageTitle from '../components/common/PageTitle'
import PlaceForm from '../components/forms/PlaceForm'
import { useApp } from '../context/AppContext'

export default function EditPlacePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { places, updatePlace } = useApp()
  const place = places.find(item => item.id === id)

  if (!place) return <div>Lugar no encontrado</div>

  const initialValues = {
    ...place,
    necesidadesTexto: place.necesidades.map(n => n.item).join(', ')
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title={`Editar: ${place.nombre}`} description="Actualiza la información del punto." />
      <PlaceForm
        initialValues={initialValues}
        submitLabel="Guardar cambios"
        onSubmit={(data) => {
          updatePlace(id, data)
          navigate(`/lugares/${id}`)
        }}
      />
    </div>
  )
}
