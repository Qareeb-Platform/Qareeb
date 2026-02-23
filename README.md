# Qareeb (قريب) — Community Platform

> **Connecting Muslims with nearby religious services**

A full-stack, non-profit web platform covering three domains:
1. **Imams & Mosques** — Directory with recitation audio/video
2. **Quran Memorization Circles (Halaqat)** — Filtered by type & location
3. **Mosque Maintenance Requests** — Connect mosques with donors

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, next-intl |
| **Backend** | NestJS, Prisma ORM, PostgreSQL + PostGIS |
| **Auth** | JWT (RS256 / HS256), bcrypt, HttpOnly cookies |
| **Media** | Cloudinary (signed uploads) |
| **State** | Zustand (client), Redis (server cache) |
| **i18n** | Arabic (RTL) + English (LTR) |

## Project Structure

```
qareeb/
├── apps/
│   ├── api/              # NestJS Backend
│   │   ├── prisma/       # Schema, migrations, seed
│   │   └── src/
│   │       ├── auth/     # JWT auth, guards, roles
│   │       ├── imams/    # Imams CRUD + geospatial
│   │       ├── halaqat/  # Halaqat CRUD + geospatial
│   │       ├── maintenance/  # Maintenance CRUD
│   │       ├── media/    # Cloudinary signing
│   │       ├── admin/    # Dashboard stats, user mgmt
│   │       └── prisma/   # Prisma service
│   └── web/              # Next.js Frontend
│       └── src/
│           ├── app/[locale]/     # i18n pages
│           │   ├── imams/        # Listing, detail, submit
│           │   ├── halaqat/      # Listing, detail, submit
│           │   ├── maintenance/  # Listing, detail, submit
│           │   └── admin/        # Dashboard, review queues
│           ├── components/       # Layout, UI, Chat
│           ├── lib/              # API client, utils, store
│           └── messages/         # AR/EN translations
├── package.json          # Monorepo root (npm workspaces)
└── .env.example          # Environment variables template
```

## Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ with PostGIS extension
- npm 9+

### 1. Clone & Install

```bash
git clone <repo-url> qareeb
cd qareeb
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
# Edit .env with your database URL and other credentials
```

**Required variables:**
- `DATABASE_URL` — PostgreSQL connection string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` (optional, falls back to HS256)

### 3. Database Setup

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
# Apply PostGIS extensions:
psql $DATABASE_URL -f prisma/migrations/postgis_setup.sql
# Seed sample data:
npx prisma db seed
```

### 4. Run Development Servers

```bash
# From root:
npm run dev
# Or individually:
npm run dev:api   # → http://localhost:3001/v1
npm run dev:web   # → http://localhost:3000
```

### 5. Access the App

- **Homepage:** http://localhost:3000/ar (Arabic RTL)
- **English:** http://localhost:3000/en
- **Admin Login:** http://localhost:3000/ar/admin

### Demo Admin Credentials

| Email | Password | Role |
|---|---|---|
| admin@qareeb.app | admin123456 | super_admin |
| imam.reviewer@qareeb.app | admin123456 | imam_reviewer |
| halqa.reviewer@qareeb.app | admin123456 | halqa_reviewer |
| maint.reviewer@qareeb.app | admin123456 | maintenance_reviewer |
| full.reviewer@qareeb.app | admin123456 | full_reviewer |

## API Endpoints

### Public
| Method | Path | Description |
|---|---|---|
| GET | `/v1/imams` | List imams (supports geo query) |
| GET | `/v1/imams/:id` | Get imam details |
| POST | `/v1/imams` | Submit new imam |
| GET | `/v1/halaqat` | List circles |
| POST | `/v1/halaqat` | Submit new circle |
| GET | `/v1/maintenance` | List maintenance requests |
| POST | `/v1/maintenance` | Submit new request |
| POST | `/v1/media/sign` | Get Cloudinary upload signature |

### Admin (JWT required)
| Method | Path | Description |
|---|---|---|
| POST | `/v1/admin/auth/login` | Admin login |
| GET | `/v1/admin/dashboard/stats` | Dashboard statistics |
| PATCH | `/v1/admin/{entity}/:id/approve` | Approve submission |
| PATCH | `/v1/admin/{entity}/:id/reject` | Reject submission |
| GET | `/v1/admin/users` | List admins (super_admin) |
| POST | `/v1/admin/users` | Create admin (super_admin) |

## Deployment

### Frontend (Vercel)
```bash
cd apps/web && npm run build
# Deploy to Vercel with NEXT_PUBLIC_API_URL set
```

### Backend (Railway / Render)
```bash
cd apps/api && npm run build
# Deploy as Docker container with DATABASE_URL set
```

### Infrastructure
- **Database:** Supabase (managed PostgreSQL + PostGIS)
- **Media:** Cloudinary (free tier: 25GB)
- **Cache:** Upstash Redis (serverless)

## Admin Roles

| Role | Permissions |
|---|---|
| `super_admin` | All permissions + user management |
| `full_reviewer` | Approve/reject all entity types |
| `imam_reviewer` | Approve/reject imams only |
| `halqa_reviewer` | Approve/reject halaqat only |
| `maintenance_reviewer` | Approve/reject maintenance only |

---

*Qareeb — A non-profit community service project* 🕌
