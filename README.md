# Alygo Admin Dashboard

Enterprise-grade admin operations platform for the Alygo rideshare ecosystem (Driver App, Passenger App, Admin Dashboard).

## Tech Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** + **Ant Design 6** + **Lucide React**
- **Redux Toolkit** + **RTK Query**
- **Socket.IO Client** (real-time updates)
- **Recharts** (analytics)
- **React Hook Form** + **Zod** (forms)
- **React Router 7** (routing)
- **JWT + RBAC** (authentication & authorization)

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Demo credentials:** `admin@alygo.com` / `admin123`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend REST API base URL |
| `VITE_SOCKET_URL` | Socket.IO server URL |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key for maps/heatmaps |

## Project Structure

```
src/
├── app/              # App-level providers (via App.tsx)
├── routes/           # Router config & protected routes
├── layouts/          # Dashboard & auth layouts
├── pages/            # Auth, 404
├── features/         # Feature modules (domain-driven)
├── services/         # API, Socket.IO, mock data
├── store/            # Redux slices & RTK Query
├── hooks/            # Custom React hooks
├── components/       # Shared UI components
├── utils/            # Utilities
├── constants/        # App constants & navigation
└── types/            # TypeScript definitions
```

## Features

- Executive dashboard with real-time KPIs
- Driver & passenger management
- Compliance center & eligibility engine
- Dynamic pricing & surge zones
- Reservations & airport management
- Finance module (Stripe-ready)
- Demand intelligence & analytics
- RBAC with 5 admin roles
- Dark theme with glassmorphism UI

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design documentation.
