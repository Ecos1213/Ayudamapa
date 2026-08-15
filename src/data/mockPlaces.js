export const mockPlaces = [
  {
    id: 'place-1',
    nombre: 'Albergue San José',
    tipo: 'albergue',
    ciudad: 'Cali',
    departamento: 'Valle del Cauca',
    lat: 3.4516,
    lng: -76.5320,
    direccion: 'Cra. 10 #20-30',
    capacidad: 200,
    personasAtendidas: 183,
    contacto: '300 555 1020',
    estadoAcceso: 'Accesible',
    nivelUrgencia: 'alta',
    estado: 'activo',
    ultimaActualizacion: '2026-08-13T11:42:00',
    reportadoPor: 'Laura Gómez',
    verificado: true,
    necesidades: [
      { id: 1, item: 'Agua', cantidadRequerida: 500, cantidadCubierta: 150, unidad: 'L', estado: 'pendiente' },
      { id: 2, item: 'Alimentos', cantidadRequerida: 300, cantidadCubierta: 250, unidad: 'raciones', estado: 'parcial' },
      { id: 3, item: 'Medicamentos', cantidadRequerida: 50, cantidadCubierta: 50, unidad: 'unidades', estado: 'cubierta' }
    ]
  },
  {
    id: 'place-2',
    nombre: 'Centro de Salud La Esperanza',
    tipo: 'salud',
    ciudad: 'Cali',
    departamento: 'Valle del Cauca',
    lat: 3.4372,
    lng: -76.5225,
    direccion: 'Calle 8 #34-15',
    capacidad: 80,
    personasAtendidas: 61,
    contacto: '602 555 2030',
    estadoAcceso: 'Accesible',
    nivelUrgencia: 'media',
    estado: 'activo',
    ultimaActualizacion: '2026-08-13T10:15:00',
    reportadoPor: 'Defensa Civil',
    verificado: true,
    necesidades: [
      { id: 4, item: 'Medicamentos', cantidadRequerida: 120, cantidadCubierta: 70, unidad: 'unidades', estado: 'parcial' },
      { id: 5, item: 'Suero', cantidadRequerida: 50, cantidadCubierta: 0, unidad: 'unidades', estado: 'pendiente' }
    ]
  },
  {
    id: 'place-3',
    nombre: 'Punto de Acopio Norte',
    tipo: 'acopio',
    ciudad: 'Palmira',
    departamento: 'Valle del Cauca',
    lat: 3.5394,
    lng: -76.3036,
    direccion: 'Av. 19 #30-12',
    capacidad: 500,
    personasAtendidas: 0,
    contacto: '301 555 3030',
    estadoAcceso: 'Accesible',
    nivelUrgencia: 'baja',
    estado: 'activo',
    ultimaActualizacion: '2026-08-13T08:20:00',
    reportadoPor: 'Cruz Roja',
    verificado: true,
    necesidades: [
      { id: 6, item: 'Ropa', cantidadRequerida: 300, cantidadCubierta: 300, unidad: 'kits', estado: 'cubierta' }
    ]
  },
  {
    id: 'place-4',
    nombre: 'Zona de Rescate El Diamante',
    tipo: 'rescate',
    ciudad: 'Jamundí',
    departamento: 'Valle del Cauca',
    lat: 3.2606,
    lng: -76.5349,
    direccion: 'Sector El Diamante',
    capacidad: 0,
    personasAtendidas: 42,
    contacto: '315 555 4040',
    estadoAcceso: 'Vía parcialmente bloqueada',
    nivelUrgencia: 'alta',
    estado: 'en_riesgo',
    ultimaActualizacion: '2026-08-13T11:05:00',
    reportadoPor: 'Bomberos',
    verificado: true,
    necesidades: [
      { id: 7, item: 'Agua', cantidadRequerida: 200, cantidadCubierta: 0, unidad: 'L', estado: 'pendiente' },
      { id: 8, item: 'Equipos de rescate', cantidadRequerida: 10, cantidadCubierta: 4, unidad: 'unidades', estado: 'parcial' }
    ]
  },
  {
    id: 'place-5',
    nombre: 'Albergue Comunitario El Poblado',
    tipo: 'albergue',
    ciudad: 'Yumbo',
    departamento: 'Valle del Cauca',
    lat: 3.5830,
    lng: -76.4950,
    direccion: 'Carrera 4 #12-08',
    capacidad: 150,
    personasAtendidas: 97,
    contacto: '302 555 5050',
    estadoAcceso: 'Accesible',
    nivelUrgencia: 'media',
    estado: 'activo',
    ultimaActualizacion: '2026-08-12T16:30:00',
    reportadoPor: 'Voluntarios Yumbo',
    verificado: false,
    necesidades: [
      { id: 9, item: 'Alimentos', cantidadRequerida: 200, cantidadCubierta: 50, unidad: 'raciones', estado: 'pendiente' }
    ]
  }
]

export const typeLabels = {
  albergue: 'Albergue / centro de acogida',
  rescate: 'Zona de rescate',
  acopio: 'Punto de acopio',
  salud: 'Centro de salud',
  incidencia: 'Incidencia'
}

export const reportTypeLabels = {
  persona_atrapada: 'Persona atrapada',
  persona_desaparecida: 'Persona desaparecida',
  persona_herida: 'Persona herida',
  dano_estructural: 'Daño estructural',
  via_bloqueada: 'Vía o acceso bloqueado',
  incendio: 'Incendio',
  inundacion: 'Inundación',
  emergencia_medica: 'Emergencia médica',
  necesidad: 'Necesidad urgente de recursos',
  otra: 'Otra situación'
}

export const reportTypeColors = {
  persona_atrapada: 'red',
  persona_desaparecida: 'violet',
  persona_herida: 'rose',
  dano_estructural: 'orange',
  via_bloqueada: 'amber',
  incendio: 'red',
  inundacion: 'cyan',
  emergencia_medica: 'pink',
  necesidad: 'blue',
  otra: 'slate'
}

export const urgencyLabels = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja'
}

export const stateLabels = {
  activo: 'Activo',
  cerrado: 'Cerrado',
  en_riesgo: 'En riesgo'
}

export const needStateLabels = {
  cubierta: 'Cubierta',
  parcial: 'Parcial',
  pendiente: 'Pendiente'
}
