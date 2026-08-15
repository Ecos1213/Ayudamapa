# Ayudamapa - Backend API

Node.js + Express REST API for disaster response coordination. Provides endpoints for authentication, pin management (incident reports), supply requests, volunteer assignments, and offline data synchronization.

## Features

- 🔐 JWT-based authentication via Supabase
- 🗺️ PostGIS geospatial queries for location-based pin filtering
- 🔄 Offline sync support with conflict resolution
- 📋 Role-based access control (victim, volunteer, coordinator, admin)
- 🚀 Scalable RESTful architecture with Express middleware
- 📦 Docker support for consistent local and production environments
- 🛡️ Security middleware (helmet, CORS, rate limiting)

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 14+ with PostGIS extension
- Supabase account
- Docker and Docker Compose (optional, for containerized development)

## Quick Start

### 1. Local Development Setup

#### Clone and Install

```bash
npm install
```

#### Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/ayudamapa_db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:5173
```

#### Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000` with auto-restart on file changes.

### 2. Docker Setup (Recommended)

#### Start Services

```bash
docker-compose up
```

This starts:
- Backend API on `http://localhost:3000`
- PostgreSQL database on `localhost:5432`

Database migrations run automatically on container start.

#### Stop Services

```bash
docker-compose down
```

## Project Structure

```
src/
├── index.js                 # Application entry point
├── routes/
│   ├── authRoutes.js       # Authentication endpoints
│   ├── pinsRoutes.js       # Pin CRUD endpoints
│   ├── syncRoutes.js       # Offline sync endpoints
│   └── supplyRoutes.js     # Supply request endpoints
├── models/
│   ├── User.js             # User model
│   ├── Pin.js              # Pin model
│   ├── SupplyRequest.js    # Supply request model
│   └── Volunteer.js        # Volunteer model
├── middleware/
│   ├── auth.js             # JWT validation middleware
│   ├── errorHandler.js     # Error handling middleware
│   ├── validation.js       # Request validation
│   └── rateLimit.js        # Rate limiting middleware
├── db/
│   ├── migrations/         # Database migration files
│   └── seeds/              # Seed data for development
└── utils/
    ├── logger.js           # Logging utility
    └── helpers.js          # Helper functions
```

## API Endpoints

### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token
- `GET /profile` - Get authenticated user's profile
- `PATCH /profile` - Update user profile

### Pins (Incident Reports)

- `POST /api/pins` - Create a pin
- `GET /api/pins` - List all pins (with optional filters)
- `GET /api/pins/:id` - Get pin details
- `PATCH /api/pins/:id` - Update pin
- `DELETE /api/pins/:id` - Delete pin
- `GET /api/pins/nearby?lat=X&lng=Y&radius=5` - Find nearby pins

### Supply Requests

- `POST /api/supply_requests` - Add supply request to a pin
- `PATCH /api/supply_requests/:id` - Update supply request
- `DELETE /api/supply_requests/:id` - Delete supply request

### Offline Sync

- `GET /api/sync?since=ISO8601_timestamp` - Get updates since timestamp
- `POST /api/sync` - Sync offline changes to server

## Offline Sync Protocol

The sync endpoints enable offline-first functionality with conflict resolution. Clients can create pins and requests offline, then sync when connectivity is restored.

### GET /api/sync - Fetch Changes

**Purpose:** Clients request all changes (pins, supply requests, volunteer assignments) since a given timestamp.

**Request:**
```
GET /api/sync?since=2024-01-15T10:30:00Z&limit=100
Authorization: Bearer <JWT_TOKEN>
```

**Parameters:**
- `since` (ISO8601 timestamp, required): Only return records with `updated_at > since`
- `limit` (number, optional, default: 100): Maximum records per entity type

**Response (200 OK):**
```json
{
  "pins": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "damage",
      "location": "POINT(75.5 4.4)",
      "severity": "critical",
      "status": "reported",
      "description": "Building collapsed on Cra 10",
      "photo_url": "https://...",
      "creator_id": "user-uuid",
      "created_at": "2024-01-15T10:35:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  ],
  "supply_requests": [...],
  "volunteer_assignments": [...],
  "deletions": ["pin-id-1", "pin-id-2"],
  "server_timestamp": "2024-01-15T11:00:00Z"
}
```

**Notes:**
- Returns all public pins and user's private pins
- `deletions` array contains IDs of records deleted since timestamp
- `server_timestamp` is the server's current time; client should use this for next sync

### POST /api/sync - Upload Changes

**Purpose:** Clients submit offline-created or updated pins, supply requests, and volunteer assignments. Server handles UUID mapping and conflict detection.

**Request:**
```
POST /api/sync
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "pins": [
    {
      "id": "temp_abc123",
      "type": "damage",
      "location": "POINT(75.5 4.4)",
      "severity": "high",
      "status": "reported",
      "description": "Damaged roof",
      "creator_id": "user-uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "damage",
      "severity": "critical",
      "status": "verified",
      "updated_at": "2024-01-15T10:45:00Z"
    }
  ],
  "supply_requests": [],
  "volunteer_assignments": []
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "synced_ids": {
    "pins": [
      {
        "temp_uuid": "temp_abc123",
        "real_uuid": "550e8400-e29b-41d4-a716-446655440001"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "synced": true
      }
    ],
    "supply_requests": [],
    "volunteer_assignments": []
  },
  "conflicts": [
    {
      "id": "pin-uuid",
      "type": "pin",
      "reason": "CONFLICT_NEWER_VERSION",
      "server_updated_at": "2024-01-15T10:50:00Z",
      "client_updated_at": "2024-01-15T10:45:00Z"
    }
  ],
  "server_timestamp": "2024-01-15T11:00:00Z"
}
```

### Sync Features

#### Temporary UUIDs (Offline Creation)

When a pin is created offline without a network connection, the client generates a temporary UUID:
- Format: `temp_<random-string>` (e.g., `temp_abc123xyz`)
- On sync, server recognizes this format and replaces it with a real UUID
- Response includes mapping: `{ "temp_uuid": "temp_abc123", "real_uuid": "550e8400..." }`
- Client must update all local references from temp to real UUID

#### Conflict Detection

Conflicts occur when the same record is modified locally (offline) and remotely (by another user).

**Resolution Strategy:** Last-write-wins
- Server compares `updated_at` timestamps
- Record with newer `updated_at` is kept
- Losing change is reported in `conflicts` array
- Client is notified and can decide to resubmit or accept remote version

**Example Conflict Response:**
```json
{
  "conflicts": [
    {
      "id": "pin-uuid",
      "type": "pin",
      "reason": "CONFLICT_NEWER_VERSION",
      "server_updated_at": "2024-01-15T10:50:00Z",
      "client_updated_at": "2024-01-15T10:45:00Z"
    }
  ]
}
```

#### Idempotency

If the same offline-created pin is synced multiple times (e.g., sync fails after insert but before response):
- Server checks if `temp_uuid` already exists in the database
- If found, returns the existing real UUID instead of creating a duplicate
- Ensures safe retry logic on the client

#### Rate Limiting

Sync endpoints are rate-limited to **1 request per second per user** to prevent abuse during disasters:
- Limits: `max_requests=1, window=1000ms`
- Response on limit exceeded: `429 Too Many Requests`
- Header: `Retry-After: 1`

#### Pagination

Large offline sync batches are paginated:
- `limit` parameter controls batch size (default: 100, max: 1000)
- Client should paginate when uploading many changes
- Example: Client has 500 pending pins → send 5 requests with 100 pins each

## Database Schema

### Users Table
```sql
id (UUID)
email (unique)
phone_number
display_name
role (victim|volunteer|coordinator|admin)
language_preference
created_at
updated_at
```

### Pins Table
```sql
id (UUID)
creator_id (FK to users)
pin_type (damage|supply|volunteer)
location (PostGIS Point)
severity (low|medium|high|critical)
status (reported|verified|resolved)
description
photo_url
created_at
updated_at
verified_by (FK to users)
```

### Supply Requests Table
```sql
id (UUID)
pin_id (FK to pins)
item_category
item_name
quantity_needed
quantity_fulfilled
unit
urgency_level
created_at
updated_at
```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests (when configured)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | postgresql://user:pass@localhost:5432/db |
| `SUPABASE_URL` | Supabase project URL | https://project.supabase.co |
| `SUPABASE_KEY` | Supabase service role key | eyJxxx... |
| `SUPABASE_JWT_SECRET` | JWT signing secret | your-secret |
| `CORS_ORIGIN` | Allowed frontend origin | http://localhost:5173 |
| `JWT_EXPIRY` | JWT token expiry (seconds) | 3600 |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry (seconds) | 604800 |
| `LOG_LEVEL` | Logging level | info |

## Deployment

### Render

```bash
# Connect GitHub repository
# Set environment variables in dashboard
# Deploy via Render UI
```

### DigitalOcean App Platform

```bash
# Connect GitHub repository
# Configure app.yaml with environment variables
# Deploy via DO dashboard
```

## Error Handling

All errors return JSON responses with standardized format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "details": { "field": "error details" }
}
```

Error codes:
- `AUTH_INVALID_TOKEN` - JWT validation failed
- `AUTH_MISSING_TOKEN` - No token provided
- `VALIDATION_ERROR` - Request validation failed
- `RESOURCE_NOT_FOUND` - Resource doesn't exist
- `UNAUTHORIZED` - User lacks permission
- `CONFLICT` - Sync conflict detected

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

MIT

## Support

For issues and feature requests, please use GitHub Issues.

## Verificación de información

Los registros nuevos se crean con `verification_status = unverified`. Los cambios de un registro vuelven a dejarlo no verificado. Solo usuarios autorizados con rol `pmu`, `coordinator` o `admin` pueden llamar a `PATCH /api/pins/:id/review` para verificar o mantener un registro no verificado.
