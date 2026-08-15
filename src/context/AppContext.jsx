import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createPlace, listPlaces, reviewPlace as reviewPlaceRequest, updatePlace as updatePlaceRequest } from '../services/placesService'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshPlaces = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listPlaces()
      setPlaces(data)
      setError('')
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los lugares.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refreshPlaces() }, [refreshPlaces])

  const addPlace = useCallback(async (place) => {
    const created = await createPlace(place)
    setPlaces(current => [created, ...current])
    return created
  }, [])

  const updatePlace = useCallback(async (id, changes) => {
    const updated = await updatePlaceRequest(id, changes)
    setPlaces(current => current.map(place => place.id === id ? updated : place))
    return updated
  }, [])

  const reviewPlace = useCallback(async (id, approved) => {
    const updated = await reviewPlaceRequest(id, approved)
    setPlaces(current => current.map(place => place.id === id ? updated : place))
    return updated
  }, [])

  const value = useMemo(() => ({ places, loading, error, refreshPlaces, addPlace, updatePlace, reviewPlace }), [places, loading, error, refreshPlaces, addPlace, updatePlace, reviewPlace])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe utilizarse dentro de AppProvider')
  return context
}
