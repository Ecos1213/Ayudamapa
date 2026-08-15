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

## Reglas funcionales de verificación

- Consultar y registrar información es público.
- Los lugares e incidencias nuevos quedan **no verificados**.
- Un usuario registrado puede editar sus propios registros; cualquier edición vuelve a dejar el registro **no verificado**.
- La verificación corresponde al rol `pmu`, `coordinator` o `admin`.
- La dirección puede ser suficiente para registrar un lugar; las coordenadas son opcionales.
- `Usar mi ubicación actual` obtiene la ubicación del navegador cuando el usuario concede permiso.
## Ubicación opcional y Leaflet

La dirección puede existir sin coordenadas GPS. Los registros sin latitud/longitud se muestran en listados y detalles, pero no se crean marcadores Leaflet hasta que tengan coordenadas válidas.

## Reglas funcionales actuales

- La consulta y el registro de lugares/reportes son públicos.
- La edición de lugares y reportes también es pública; no requiere iniciar sesión.
- Cada modificación devuelve el registro al estado **no verificado**.
- La verificación se realiza mediante la función de revisión disponible para usuarios autorizados.
- Un **lugar** identifica un punto como albergue/centro de acogida, zona de rescate, punto de acopio, centro de salud o incidencia.
- Un **reporte** describe un hecho o situación: persona atrapada/desaparecida, daño estructural, vía bloqueada, emergencia médica, incendio, inundación, necesidad urgente u otra situación.
