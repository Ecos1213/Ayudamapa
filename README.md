# Ayudamapa - Frontend

A React + Vite web application for disaster response coordination. Enables citizens, volunteers, and coordinators to share real-time information about damage, supply needs, and volunteer assistance during emergencies.

## Features

- 📍 Interactive map-driven incident reporting (Leaflet + PostGIS)
- 🌐 Offline-first functionality with IndexedDB and Service Workers
- 🗣️ Multilingual support (Spanish default, English fallback)
- 📱 Progressive Web App (PWA) capabilities
- 🔐 Authentication via Supabase JWT
- 🎯 Pin clustering and filtering by type/urgency/status
- ♻️ Automatic sync when connection is restored

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Supabase account with PostgreSQL + PostGIS enabled

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000
VITE_DEFAULT_LANGUAGE=es
```

### 3. Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` with HMR enabled.

### 4. Production Build

```bash
npm run build
```

Optimized bundle is created in `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Layout components (Header, Footer, etc.)
│   │   ├── pins/            # Pin-related components
│   │   └── common/          # Common components
│   ├── pages/               # Page components
│   └── App.jsx              # Root component
├── utils/                   # Utility functions
│   ├── apiClient.js        # Axios instance with auth
│   ├── queryClient.js      # TanStack Query setup
│   └── helpers.js          # Helper functions
├── hooks/                   # Custom React hooks
│   └── useAuth.js          # Auth hook
├── services/                # Service layer
│   └── authService.js      # Auth service
├── store/                   # State management (Zustand)
│   └── useAppStore.js      # App store
├── i18n/                    # Internationalization
│   ├── index.js            # i18n setup
│   └── locales/            # Translation files
│       ├── es.json         # Spanish translations
│       └── en.json         # English translations
└── assets/                  # Images, fonts, etc.
```

## Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Dependencies

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **Leaflet** - Map library
- **Leaflet.markercluster** - Marker clustering
- **Zustand** - State management
- **TanStack Query** - Server state management
- **i18next** - Internationalization
- **axios** - HTTP client

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir dist
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

MIT

## Support

For issues and feature requests, please use GitHub Issues.
=======
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

