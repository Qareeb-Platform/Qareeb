# منصة قريب (Qareeb) — Technical Specification v1.0

> **Project Type:** Non-profit Web App | **Status:** Ready for Engineering Handoff  
> **Stack:** Next.js 14 · TypeScript · PostgreSQL/PostGIS · Prisma · Cloudinary

---

## 1. Project Overview

Qareeb is a community-driven, non-profit web platform connecting Muslims with nearby religious services. It covers **three primary domains**:

1. **Imams & Mosques** — Directory of imams by region with recitation audio/video
2. **Quran Memorization Circles (Halaqat)** — Filtered by gender/age group and location
3. **Mosque Maintenance Requests** — Connects mosques needing work with donors

**Content Model:** User-generated submissions → Admin moderation → Public listing  
**No financial transactions** — platform is a discovery and connection tool only

---

## 2. System Architecture

```
User Browser ──→ Next.js (SSR/ISR) ──→ REST API ──→ PostgreSQL/PostGIS
                                                  └──→ Redis (cache)
Media Upload: Browser ──→ Cloudinary (signed upload) ──→ URL stored in DB
Admin:        /admin/* ──→ NextAuth session check ──→ Protected API endpoints
```

**Key architecture decisions:**
- Monorepo: `apps/web` (Next.js) + `apps/api` (Node/Express or NestJS)
- Stateless REST API consumed by Next.js via Server Components & Route Handlers
- Geospatial queries handled by PostGIS extension on PostgreSQL
- All media on Cloudinary CDN (images + YouTube links for video)
- Redis for caching frequently-queried listing pages

---

## 3. Tech Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | ^14.x | App Router, SSR, ISR, API Route Handlers |
| TypeScript | ^5.x | Type safety across full stack |
| Tailwind CSS | ^3.x | Utility-first styling, RTL support |
| next-intl | latest | AR/EN i18n with RTL/LTR auto-switch |
| React Leaflet | latest | Interactive maps + geolocation |
| Recharts | latest | Admin dashboard charts |
| Zustand | latest | Lightweight client-side state |
| React Hook Form + Zod | latest | Form handling & validation |
| next-cloudinary | latest | Optimized Cloudinary image component |

### 3.2 Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ^20.x LTS | Runtime |
| NestJS | latest | REST API framework (preferred for scale) |
| PostgreSQL | ^16.x | Primary relational database |
| PostGIS | ^3.x | Geospatial extension for radius/proximity queries |
| Prisma ORM | ^5.x | Type-safe DB access; supports raw PostGIS queries |
| Redis | ^7.x | Cache layer for listing pages |
| NextAuth.js | ^4.x | Admin authentication (JWT + session) |
| Cloudinary SDK | latest | Server-side signed upload |
| Zod | latest | Schema validation on API input |
| Helmet + express-rate-limit | latest | Security headers & rate limiting |

### 3.3 Infrastructure

| Service | Purpose |
|---|---|
| Vercel | Frontend hosting (auto CI/CD from main branch) |
| Railway or Render | Backend hosting (Docker container) |
| Supabase | Managed PostgreSQL + PostGIS |
| Cloudinary | Media CDN (free tier: 25GB storage / 25GB bandwidth/month) |
| Upstash Redis | Serverless Redis (free tier) |
| GitHub Actions | CI/CD: lint → typecheck → test → deploy |

---

## 4. Database Schema (PostgreSQL + PostGIS)

### 4.1 Enums

```sql
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE halqa_type AS ENUM ('men', 'women', 'children', 'mixed');
CREATE TYPE maintenance_type AS ENUM (
  'flooring', 'ac', 'plumbing', 'painting', 'furniture', 'electrical', 'other'
);
CREATE TYPE admin_role AS ENUM (
  'super_admin', 'full_reviewer',
  'imam_reviewer', 'halqa_reviewer', 'maintenance_reviewer'
);
```

### 4.2 Table: `imams`

```sql
CREATE TABLE imams (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  imam_name         VARCHAR(120)  NOT NULL,
  mosque_name       VARCHAR(200)  NOT NULL,
  governorate       VARCHAR(100)  NOT NULL,
  city              VARCHAR(100)  NOT NULL,
  district          VARCHAR(100),
  location          GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS: (lng, lat)
  whatsapp          VARCHAR(20)   NOT NULL,
  recitation_url    TEXT,                              -- YouTube or Cloudinary URL
  status            submission_status DEFAULT 'pending',
  rejection_reason  TEXT,
  submitted_by_ip   INET,
  admin_id          UUID          REFERENCES admins(id),
  created_at        TIMESTAMPTZ   DEFAULT now(),
  updated_at        TIMESTAMPTZ   DEFAULT now()
);
```

### 4.3 Table: `halaqat`

```sql
CREATE TABLE halaqat (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_name      VARCHAR(200)  NOT NULL,
  mosque_name      VARCHAR(200)  NOT NULL,
  halqa_type       halqa_type    NOT NULL,
  governorate      VARCHAR(100)  NOT NULL,
  city             VARCHAR(100)  NOT NULL,
  district         VARCHAR(100),
  location         GEOGRAPHY(POINT, 4326) NOT NULL,
  whatsapp         VARCHAR(20)   NOT NULL,
  additional_info  TEXT,                              -- Schedule, capacity, etc.
  status           submission_status DEFAULT 'pending',
  rejection_reason TEXT,
  admin_id         UUID          REFERENCES admins(id),
  created_at       TIMESTAMPTZ   DEFAULT now(),
  updated_at       TIMESTAMPTZ   DEFAULT now()
);
```

### 4.4 Table: `maintenance_requests`

```sql
CREATE TABLE maintenance_requests (
  id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_name         VARCHAR(200)      NOT NULL,
  governorate         VARCHAR(100)      NOT NULL,
  city                VARCHAR(100)      NOT NULL,
  district            VARCHAR(100),
  location            GEOGRAPHY(POINT, 4326) NOT NULL,
  maintenance_types   maintenance_type[] NOT NULL,   -- Array: multiple types allowed
  description         TEXT              NOT NULL,
  estimated_cost_min  INTEGER,                       -- Optional cost range
  estimated_cost_max  INTEGER,
  whatsapp            VARCHAR(20)       NOT NULL,
  status              submission_status DEFAULT 'pending',
  rejection_reason    TEXT,
  admin_id            UUID              REFERENCES admins(id),
  created_at          TIMESTAMPTZ       DEFAULT now(),
  updated_at          TIMESTAMPTZ       DEFAULT now()
);
```

### 4.5 Table: `media_assets`

```sql
CREATE TABLE media_assets (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  VARCHAR(30)  NOT NULL,   -- 'imam' | 'halqa' | 'maintenance'
  entity_id    UUID         NOT NULL,   -- FK to owning entity
  url          TEXT         NOT NULL,   -- Cloudinary URL
  public_id    TEXT         NOT NULL,   -- Cloudinary public_id (for deletion)
  media_type   VARCHAR(10)  NOT NULL,   -- 'image' | 'audio'
  sort_order   SMALLINT     DEFAULT 0,
  created_at   TIMESTAMPTZ  DEFAULT now()
);
```

### 4.6 Table: `admins`

```sql
CREATE TABLE admins (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  TEXT         NOT NULL,              -- bcrypt, cost 12
  role           admin_role   NOT NULL,
  is_active      BOOLEAN      DEFAULT true,
  created_by     UUID         REFERENCES admins(id), -- super_admin who created
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  DEFAULT now()
);
```

### 4.7 Indexes

```sql
-- Geospatial indexes (GIST for PostGIS)
CREATE INDEX idx_imams_location      ON imams              USING GIST(location);
CREATE INDEX idx_halaqat_location    ON halaqat            USING GIST(location);
CREATE INDEX idx_maintenance_location ON maintenance_requests USING GIST(location);

-- Filter indexes
CREATE INDEX idx_imams_status        ON imams(status);
CREATE INDEX idx_imams_governorate   ON imams(governorate);
CREATE INDEX idx_halaqat_type        ON halaqat(halqa_type);
CREATE INDEX idx_maintenance_types   ON maintenance_requests USING GIN(maintenance_types);
```

### 4.8 Geospatial Query Example

```sql
-- Find approved imams within 5km of a given point, sorted by distance
SELECT *,
  ST_Distance(location, ST_MakePoint($lng, $lat)::geography) AS dist_meters
FROM imams
WHERE status = 'approved'
  AND ST_DWithin(location, ST_MakePoint($lng, $lat)::geography, 5000)
ORDER BY dist_meters ASC
LIMIT 20 OFFSET $offset;
```

---

## 5. REST API Specification

### 5.1 Base URLs

```
Production:  https://api.qareeb.app/v1
Staging:     https://api-staging.qareeb.app/v1
```

### 5.2 Authentication

- **Public endpoints:** No auth required
- **Admin endpoints:** `Authorization: Bearer <access_token>` (JWT)
- **Access token expiry:** 15 minutes
- **Refresh token expiry:** 7 days (HttpOnly cookie)
- Algorithm: RS256 (RSA key pair)

### 5.3 Standard Pagination Response

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 340,
    "totalPages": 17,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 5.4 Public Endpoints

#### Imams

| Method | Path | Query Params |
|---|---|---|
| GET | `/imams` | `lat, lng, radius, governorate, city, district, page, limit` |
| GET | `/imams/:id` | — |
| POST | `/imams` | Body: imam submission object |

#### Halaqat

| Method | Path | Query Params |
|---|---|---|
| GET | `/halaqat` | `lat, lng, radius, type, governorate, city, page, limit` |
| GET | `/halaqat/:id` | — |
| POST | `/halaqat` | Body: halqa submission object |

#### Maintenance Requests

| Method | Path | Query Params |
|---|---|---|
| GET | `/maintenance` | `lat, lng, radius, type, governorate, city, page, limit` |
| GET | `/maintenance/:id` | — |
| POST | `/maintenance` | Body: maintenance submission object |

#### Media

| Method | Path | Description |
|---|---|---|
| POST | `/media/sign` | Get Cloudinary signed upload params (server-side signing) |
| DELETE | `/media/:public_id` | Delete Cloudinary asset — **admin only** |

### 5.5 Admin Endpoints (JWT Required)

| Method | Path | Description |
|---|---|---|
| POST | `/admin/auth/login` | Login → returns `access_token` + sets refresh cookie |
| POST | `/admin/auth/refresh` | Refresh access token |
| GET | `/admin/dashboard/stats` | Counts, charts data (see schema below) |
| GET | `/admin/imams` | Paginated list with `?status=pending\|approved\|rejected` |
| PATCH | `/admin/imams/:id/approve` | Approve submission |
| PATCH | `/admin/imams/:id/reject` | Reject — body: `{ "reason": "..." }` (optional) |
| DELETE | `/admin/imams/:id` | Hard delete — **super_admin only** |
| GET | `/admin/halaqat` | Same pattern as imams |
| PATCH | `/admin/halaqat/:id/approve` | — |
| PATCH | `/admin/halaqat/:id/reject` | — |
| GET | `/admin/maintenance` | Same pattern as imams |
| PATCH | `/admin/maintenance/:id/approve` | — |
| PATCH | `/admin/maintenance/:id/reject` | — |
| GET | `/admin/users` | List all admins — **super_admin only** |
| POST | `/admin/users` | Create admin — **super_admin only** |
| PATCH | `/admin/users/:id` | Update role or `is_active` — **super_admin only** |

### 5.6 POST /imams — Request Body

```json
{
  "imam_name": "أحمد محمد",
  "mosque_name": "مسجد النور",
  "governorate": "الرياض",
  "city": "الرياض",
  "district": "العليا",
  "location": { "lat": 24.6877, "lng": 46.7219 },
  "whatsapp": "+966501234567",
  "recitation_url": "https://youtube.com/watch?v=...",
  "media_ids": ["uuid-of-uploaded-image"]
}
```

### 5.7 GET /admin/dashboard/stats — Response Shape

```json
{
  "pending": { "imams": 12, "halaqat": 5, "maintenance": 8 },
  "total":   { "imams": 340, "halaqat": 120, "maintenance": 67 },
  "byGovernorate": [
    { "name": "الرياض", "count": 145 },
    { "name": "جدة", "count": 98 }
  ],
  "last30Days": [
    { "date": "2024-01-01", "count": 4 },
    { "date": "2024-01-02", "count": 7 }
  ],
  "maintenanceTypeBreakdown": [
    { "type": "flooring", "count": 23 },
    { "type": "ac", "count": 15 }
  ]
}
```

---

## 6. Frontend Architecture (Next.js 14 App Router)

### 6.1 Route Structure

```
app/
├── [locale]/                        # Dynamic locale segment (ar | en)
│   ├── layout.tsx                   # Root layout — i18n provider, dir attr
│   ├── page.tsx                     # Homepage (ISR, revalidate: 60s)
│   ├── imams/
│   │   ├── page.tsx                 # Listing (SSR + geolocation client component)
│   │   ├── [id]/
│   │   │   └── page.tsx             # Detail (ISR, revalidate: 300s)
│   │   └── submit/
│   │       └── page.tsx             # Submission form (CSR)
│   ├── halaqat/                     # Same structure as imams/
│   ├── maintenance/                 # Same structure as imams/
│   └── admin/                       # Protected route group
│       ├── layout.tsx               # Auth guard + sidebar layout
│       ├── dashboard/page.tsx       # Stats + charts (CSR, no cache)
│       ├── imams/page.tsx           # Review queue
│       ├── halaqat/page.tsx
│       ├── maintenance/page.tsx
│       └── users/page.tsx           # super_admin only
├── api/
│   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   └── media/sign/route.ts          # Cloudinary signing endpoint
└── middleware.ts                    # Locale detection + admin auth guard
```

### 6.2 Rendering Strategy per Page

| Page | Strategy | Revalidate |
|---|---|---|
| Homepage | ISR | 60s |
| Listing pages | SSR (searchParams-driven) | — |
| Detail pages | ISR + OG meta | 300s |
| Submission forms | CSR | — |
| Admin dashboard | CSR | — (always fresh) |

### 6.3 i18n & RTL

```typescript
// middleware.ts — locale detection + redirect
// Supported locales: ['ar', 'en'], default: 'ar'
// Routes: /ar/imams  or  /en/imams

// layout.tsx
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>

// Translation files:
// messages/ar.json
// messages/en.json
```

### 6.4 Geolocation Flow

```
1. Listing page mounts
2. navigator.geolocation.getCurrentPosition() called
3. Permission granted → lat/lng stored in URL searchParams
4. API called: GET /imams?lat=24.68&lng=46.72&radius=10000
5. Results sorted by distance (ASC from API)
6. Map shows pins (React Leaflet + OpenStreetMap tiles)
7. If permission denied → fallback to governorate/city filter
```

### 6.5 Submission Form Flow

```
Step 1: Select type (Imam / Halqa / Maintenance)
Step 2: Basic info (name, mosque, location picker on map)
Step 3: Contact info (WhatsApp)
Step 4: Media upload (images via Cloudinary signed upload)
Step 5: Review & submit
→ POST to /imams (or /halaqat or /maintenance)
→ Show success message: "شكراً لك، سيتم مراجعة طلبك من قبل الإدارة ونشره قريباً"
```

### 6.6 Media Upload Flow

```
1. Client requests signature: POST /api/media/sign
2. Server generates Cloudinary signed params (timestamp + signature)
3. Client uploads directly to Cloudinary using signed params
4. Cloudinary returns { url, public_id }
5. Client stores public_id in form state
6. On form submit → public_id included in entity creation body
```

---

## 7. Security Specification

### 7.1 API Security

| Layer | Implementation |
|---|---|
| Rate limiting | 100 req/15min per IP on public endpoints |
| Admin login limiting | 5 failed attempts → 15min lockout |
| Input validation | Zod schema on ALL POST/PATCH bodies — 400 if invalid |
| SQL injection | Prisma parameterized queries only — no raw string interpolation |
| XSS | Next.js default escaping + DOMPurify on any rendered user content |
| CORS | Whitelist: Vercel domain + custom domain only |
| Security headers | Helmet.js: CSP, HSTS, X-Frame-Options, X-Content-Type-Options |

### 7.2 Media Security

- Cloudinary **signed uploads** — server generates signature, client uploads directly
- No direct server upload (prevents storage exhaustion)
- Max file size: **5MB** (enforced on Cloudinary upload preset)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp` only

### 7.3 Admin Auth

- Passwords: **bcrypt** with cost factor **12**
- JWT: **RS256** algorithm (RSA private/public key pair)
- Access token: 15min expiry, stored in **memory only** (not localStorage)
- Refresh token: 7 days expiry, **HttpOnly + Secure cookie**
- Role enforcement: middleware checks `admin_role` before every admin route

---

## 8. Admin Dashboard

### 8.1 Charts Required

| Chart | Library | Data Source |
|---|---|---|
| Submissions by governorate | Recharts HorizontalBarChart | `byGovernorate` array |
| Submissions last 30 days | Recharts LineChart | `last30Days` array |
| Maintenance type breakdown | Recharts PieChart | `maintenanceTypeBreakdown` array |

### 8.2 Roles & Permissions Matrix

| Action | super_admin | full_reviewer | imam_reviewer | halqa_reviewer | maint_reviewer |
|---|:---:|:---:|:---:|:---:|:---:|
| Approve/reject imams | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve/reject halaqat | ✅ | ✅ | ❌ | ✅ | ❌ |
| Approve/reject maintenance | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage admin users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Hard delete any entity | ✅ | ❌ | ❌ | ❌ | ❌ |
| View dashboard stats | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 9. Chatbot Specification

Lightweight intent-matching assistant — **NOT an LLM**. Detects keywords and redirects to pre-filtered URLs.

| Intent | Trigger Keywords (AR/EN) | Action |
|---|---|---|
| Find nearby imam | إمام / imam / مسجد / mosque | Redirect `/imams?lat=&lng=&radius=5000` |
| Children halqa | أطفال / children / تحفيظ | Redirect `/halaqat?type=children` |
| Maintenance projects | صيانة / maintenance / إعمار | Redirect `/maintenance` |
| Submit new listing | إضافة / add / submit / جديد | Open submission type selector modal |
| Specific governorate | الرياض / Riyadh / جدة / Jeddah | Redirect with `?governorate=` param |
| General help | مساعدة / help | Show quick-action buttons |

---

## 10. UI/UX Specification

### 10.1 Design Tokens

```css
/* Colors */
--color-primary:     #0D6E6E;  /* Teal green — main brand */
--color-primary-light: #E6F4F4;
--color-bg:          #FFFFFF;
--color-card-bg:     #F5F5F5;
--color-text:        #1A1A1A;
--color-text-muted:  #6B7280;

/* Typography */
--font-arabic:   'Cairo', 'Tajawal', sans-serif;
--font-english:  'Poppins', sans-serif;
--font-mono:     'Courier New', monospace;

/* Spacing */
--radius-card:   12px;
--radius-btn:    8px;
--shadow-card:   0 2px 12px rgba(0,0,0,0.08);
```

### 10.2 Component Requirements

- **Floating Action Button (FAB):** Fixed bottom-right (bottom-left in RTL) — expands to 3 options on tap
- **Cards:** Image thumbnail + name + location + verified badge + WhatsApp button
- **Map pins:** Colored by entity type (Imam: teal / Halqa: orange / Maintenance: red)
- **Mobile-first:** Touch targets minimum 44×44px, forms max 5 fields per screen

---

## 11. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Lighthouse Performance | ≥ 80 |
| Lighthouse Accessibility | ≥ 90 |
| Time to First Byte (TTFB) | < 600ms |
| Largest Contentful Paint (LCP) | < 2.5s |
| Mobile responsiveness | Works on all screen sizes ≥ 320px |
| Browser support | Chrome, Firefox, Safari — latest 2 versions |
| RTL + LTR | Both must render correctly with no layout breaks |
| Uptime target | 99.5% (Vercel + Railway SLA) |

---

## 12. Deliverables Checklist

- [ ] Full source code on private GitHub repo (monorepo)
- [ ] All Prisma migration files committed (`prisma/migrations/`)
- [ ] Staging URL — fully functional for UAT
- [ ] Admin demo credentials (shared securely)
- [ ] `README.md` covering: local setup, env vars, DB seed, deployment guide
- [ ] Loom walkthrough of admin dashboard (5–10 min)
- [ ] Cloudinary upload preset config documented
- [ ] All admin role restrictions tested with each role type

---

## 13. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/qareeb?schema=public"

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://qareeb.app"
JWT_PRIVATE_KEY="..."
JWT_PUBLIC_KEY="..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Redis
REDIS_URL="rediss://..."

# App
NEXT_PUBLIC_API_URL="https://api.qareeb.app/v1"
NEXT_PUBLIC_MAPBOX_TOKEN="..."  # or leave blank if using OpenStreetMap/Leaflet
```

---

*Qareeb Platform — Technical Specification v1.0*  
*This document contains all information required to begin implementation immediately.*
