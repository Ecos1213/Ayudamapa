import { createContext, useContext, useMemo, useState } from 'react'
import { mockPlaces } from '../data/mockPlaces'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [places, setPlaces] = useState(mockPlaces)

  const addPlace = (place) => {
    const newPlace = {
      ...place,
      id: `place-${Date.now()}`,
      ultimaActualizacion: new Date().toISOString(),
      verificado: false
    }
    setPlaces(current => [newPlace, ...current])
    return newPlace
  }

  const updatePlace = (id, changes) => {
    setPlaces(current =>
      current.map(place =>
        place.id === id
          ? { ...place, ...changes, ultimaActualizacion: new Date().toISOString() }
          : place
      )
    )
  }

  const value = useMemo(() => ({ places, addPlace, updatePlace }), [places])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe utilizarse dentro de AppProvider')
  return context
}
