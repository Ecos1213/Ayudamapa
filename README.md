# Emergencias Colombia — Frontend

Frontend MVP para una plataforma de coordinación de emergencias en Colombia.

## Stack

- React + Vite
- Tailwind CSS
- React Router
- Leaflet + OpenStreetMap
- Lucide React
- Datos mock en memoria

## Ejecutar

```bash
npm install
npm run dev
```

Luego abre la URL que indique Vite.

## Incluye

- Dashboard
- Mapa interactivo
- Listado de lugares
- Buscador y filtros
- Detalle de lugar
- Crear y editar lugares
- Reporte ciudadano
- Roles/admin como UI inicial
- Exportación CSV
- Estados y niveles de urgencia
- Indicadores de verificación
- Diseño responsive

## Siguiente etapa

El proyecto está preparado para sustituir `src/data/mockPlaces.js` y el `AppContext` por Supabase:

1. Crear tablas.
2. Conectar autenticación.
3. Implementar roles.
4. Sustituir CRUD local por servicios Supabase.
5. Añadir auditoría e historial.
6. Añadir IndexedDB + Service Worker para offline.
