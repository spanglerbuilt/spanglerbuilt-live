# SpanglerBuilt Portal — What's Been Built

**Stack:** Next.js 13.5 · Supabase · Claude AI · DALL-E 3 · Resend · Google APIs · HubSpot

---

## Architecture

```
spanglerbuilt-app/
├── pages/              Next.js pages router
│   ├── contractor/     Contractor-role pages (Michael)
│   ├── client/         Client project portal pages
│   ├── marketing/      Marketing/Cari pages
│   └── api/            Server-side API routes
├── components/
│   └── Layout.js       Shared sidebar nav (role-aware)
├── lib/                Shared server utilities
└── scripts/            CLI tools (scrapers, catalog import)
```

### Auth model
Custom localStorage auth — no session server required.  
Key: `localStorage.sb_auth` → `{ role, email, project?, ts }`

Roles: `contractor` · `marketing` · `client`

Contractor login: hardcoded email + `NEXT_PUBLIC_CONTRACTOR_PASS` env var  
Client login: email lookup against `projects` table in Supabase  
Staff login: password stored in Supabase, bcrypt-hashed

---

## Pages

### Shared
| Route | Description |
|-------|-------------|
| `/` | Redirects to `/login` |
| `/login` | Multi-step login — detects role from email, routes accordingly |
| `/signin` | Google OAuth entry point (NextAuth) |
| `/contact` | Public lead intake form — 4 steps, submits to Supabase + HubSpot + email |
| `/dashboard` | Contractor dashboard — pipeline table + 11 module tiles |
| `/ai` | AI tools hub — Claude text generation + DALL-E 3 image generation |

### Contractor (`/contractor/*`)
| Route | Description |
|-------|-------------|
| `/contractor/leads` | Project pipeline — Kanban-style status management |
| `/contractor/estimate` | Build and send tiered estimates (4 tiers × CSI 16 divisions) |
| `/contractor/schedule` | Gantt chart project scheduler (frappe-gantt) |
| `/contractor/payments` | Draw schedule and invoicing |
| `/contractor/selections` | Material selections manager |
| `/contractor/templates` | Reusable document templates |
| `/contractor/catalog` | Browse material catalog with tier/category filters |
| `/contractor/catalog-admin` | Full CRUD catalog management — add/edit/delete items, auto-photo search, Excel import |
| `/contractor/options` | Configure upgrade option packages per category |
| `/contractor/presentation` | Client-facing presentation builder |

### Client Portal (`/client/*`)
| Route | Description |
|-------|-------------|
| `/client/dashboard` | Project overview — status, phases, progress bar, navigation hub |
| `/client/estimate` | Tier selector — Good/Better/Best/Luxury with live pricing |
| `/client/options` | Upgrade options — per-category pick with price deltas |
| `/client/selections` | Material selection picker — room-by-room, swatch chooser |
| `/client/scope` | Scope of work viewer |
| `/client/schedule` | Project timeline viewer |
| `/client/documents` | Contract/document viewer and signing |
| `/client/photos` | Progress photos by phase with lightbox |
| `/client/punch-list` | Final punch list |
| `/client/messages` | Direct messaging with contractor |
| `/client/project-book` | Full project book — specs, timeline, milestones |
| `/client/warranty` | Warranty documentation |

### Marketing (`/marketing/*`)
| Route | Description |
|-------|-------------|
| `/marketing/dashboard` | Marketing KPI overview |
| `/marketing/pipeline` | Sales pipeline tracking |
| `/marketing/leads` | Lead management |
| `/marketing/campaigns` | Email campaign builder with Claude AI assist |
| `/marketing/creative` | AI creative tools (Claude + DALL-E) |
| `/marketing/ads` | Ad platform links (Google, Meta, etc.) |
| `/marketing/materials` | Brand asset library |
| `/marketing/channels` | Marketing channel management |

---

## API Routes

### Auth
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/client` | POST | Email lookup against `projects` table |
| `/api/auth/staff` | POST | Bcrypt password validation |
| `/api/auth/set-password` | POST | First-time staff password setup |
| `/api/auth/[...nextauth]` | ANY | NextAuth Google OAuth handler |

### AI
| Route | Method | Description |
|-------|--------|-------------|
| `/api/claude` | POST | Claude Sonnet 4.6 — 9 action types (estimate, proposal, email, selections, contract, changeOrder, clientChat, review, taskPlan) |
| `/api/generate-image` | POST | DALL-E 3 HD (1792×1024) — branded prompt prefix for SpanglerBuilt aesthetic |

### Leads & Projects
| Route | Method | Description |
|-------|--------|-------------|
| `/api/leads/capture` | POST | Full lead capture: Supabase insert + HubSpot upsert + Resend branded emails |
| `/api/leads/list` | GET | Returns all projects from Supabase for contractor pipeline |
| `/api/leads/update-status` | POST | Updates project status in Supabase |
| `/api/projects/[id]/estimate` | GET/POST | Per-project estimate data |
| `/api/projects/[id]/selections` | GET/POST | Per-project material selections |
| `/api/projects/[id]/option-picks` | POST | Save client upgrade selections |
| `/api/projects/[id]/approval` | POST | Project approval workflow |
| `/api/projects/[id]/book` | GET | Project book data assembly |

### Materials / Catalog
| Route | Method | Description |
|-------|--------|-------------|
| `/api/materials` | GET/POST | Fetch/add catalog materials — Supabase with 28-item static fallback |
| `/api/catalog/add` | POST/PUT/DELETE | Full CRUD for `catalog_materials` table |
| `/api/catalog/fetch-url` | POST | Scrapes Open Graph + JSON-LD from any product URL for catalog auto-fill |
| `/api/catalog/find-photo` | POST | Google Custom Search Images API — single or bulk photo lookup, saves to Supabase |
| `/api/catalog/upload-excel` | POST | Multipart Excel upload — parses in-memory, upserts all rows to Supabase |

### Integrations
| Route | Method | Description |
|-------|--------|-------------|
| `/api/schedule` | GET/POST | Project schedule (Gantt tasks) in Supabase |
| `/api/drive/files` | GET | Google Drive project folder listing |
| `/api/drive/upload` | POST | Upload file to Drive project folder |
| `/api/photos/upload` | POST | Progress photo upload |
| `/api/email/test` | POST | Test Resend email delivery |
| `/api/hubspot/webhook` | POST | HubSpot webhook receiver |
| `/api/marketing/hubspot-connect` | POST | Connect HubSpot account |
| `/api/marketing/hubspot-status` | GET | HubSpot connection status |
| `/api/marketing/send-email` | POST | Send marketing email via Resend |

---

## Components

### `components/Layout.js`
Role-aware sidebar navigation + top header for all portal pages.

- **Contractor nav:** Dashboard, Projects, Estimates, Schedule, Payments, Selections, Templates, Catalog, Catalog Admin, AI Tools
- **Marketing nav:** Dashboard, Pipeline, Leads, Campaigns, AI Creative, Ad Platforms, Materials, Channels
- **Client nav:** Dashboard, Estimate, Scope, Schedule, Selections, Options, Documents, Photos, Punch List, Messages, Warranty
- Active link highlighting via `useRouter`
- Sign-out clears `sb_auth` and redirects to `/login`

---

## Database (Supabase)

### Tables
| Table | Purpose |
|-------|---------|
| `projects` | All leads and active projects — source of truth for client login and contractor pipeline |
| `catalog_materials` | Product catalog — all materials with pricing, tier, photo, and supplier info |
| `catalog_variants` | Variant options per catalog item (finish, size, color variants) |

### `catalog_materials` columns
`id`, `category`, `subcategory`, `brand`, `product_name`, `style_type`, `size`, `finish`, `trim_style`, `unit`, `material_cost`, `labor_cost`, `total_installed`, `tier`, `photo_url`, `manufacturer_url`, `supplier`, `description`, `created_at`

### Migration file
`supabase/migrations/003_catalog.sql` — run in Supabase SQL editor to create catalog tables with seed data

---

## Lib Utilities

| File | Exports | Purpose |
|------|---------|---------|
| `lib/supabase.js` | `supabase`, `supabaseAdmin` | Client-side Supabase instance |
| `lib/supabase-server.js` | `getAdminClient()` | Server-side admin client (returns null if not configured) |
| `lib/hubspot.js` | `upsertContact()`, `createDeal()` | HubSpot CRM integration |
| `lib/drive.js` | `getDriveClient()`, `createProjectFolder()`, `listProjectFiles()`, `uploadFileToDrive()`, `shareFileWithClient()` | Google Drive per-project folder management |
| `lib/projectNumber.js` | `generateProjectNumber()` | SB-YYYY-NNN sequential project number generation |
| `lib/brandEmail.js` | `brandEmail()` | Branded HTML email template builder |

---

## Scripts (CLI)

### Catalog Scrapers
Run with `npm run scrape` (all suppliers) or individually.

| Script | npm command | Source |
|--------|------------|--------|
| `scripts/catalog-sync.js` | `npm run scrape` | Master orchestrator — runs all 5 scrapers then imports |
| `scripts/suppliers/homedepot.js` | `npm run scrape:hd` | Home Depot — internal GraphQL API + HTML fallback |
| `scripts/suppliers/wayfair.js` | `npm run scrape:wayfair` | Wayfair — JSON-LD + `__NEXT_DATA__` extraction |
| `scripts/suppliers/tileshop.js` | `npm run scrape:tileshop` | Tile Shop — Shopify JSON + Algolia API |
| `scripts/suppliers/ferguson.js` | `npm run scrape:ferguson` | Ferguson Home — JSON search API + HTML fallback |
| `scripts/suppliers/progressivelighting.js` | `npm run scrape:pl` | Progressive Lighting — Shopify `collections/products.json` |
| `scripts/import-catalog.js` | `npm run import` | Import scraped JSON files to Supabase (deduplicates by SKU+supplier) |
| `scripts/import-catalog-excel.js` | `npm run import:excel` | Import Excel spreadsheet to Supabase catalog_materials |
| `scripts/suppliers/_shared.js` | — | Shared helpers: tier assignment, HTTP fetch, rate limiting, JSON-LD extraction |

**Tier auto-assignment by price:**
- Tile: <$5 Good · $5-10 Better · $10-20 Best · >$20 Luxury
- Flooring: <$4 / $4-7 / $7-12 / >$12
- Fixtures: <$200 / $200-500 / $500-1k / >$1k
- Lighting: <$100 / $100-300 / $300-800 / >$800

---

## Environment Variables Required

| Variable | Used by | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All pages | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client pages | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes | Admin access (bypass RLS) |
| `SUPABASE_URL` | API routes | Alternate Supabase URL key |
| `SUPABASE_SERVICE_KEY` | API routes | Alternate service key |
| `ANTHROPIC_API_KEY` | `/api/claude` | Claude AI |
| `OPENAI_API_KEY` | `/api/generate-image` | DALL-E 3 |
| `GOOGLE_SEARCH_API_KEY` | `/api/catalog/find-photo` | Google Custom Search |
| `GOOGLE_SEARCH_ENGINE_ID` | `/api/catalog/find-photo` | Google CSE engine ID |
| `RESEND_API_KEY` | `/api/leads/capture`, email routes | Transactional email |
| `NEXT_PUBLIC_CONTRACTOR_PASS` | `/login` | Contractor login password |
| `HUBSPOT_ACCESS_TOKEN` | HubSpot routes | CRM integration |
| `GOOGLE_CLIENT_ID` | Drive + OAuth | Google Drive / sign-in |
| `GOOGLE_CLIENT_SECRET` | Drive + OAuth | Google Drive / sign-in |
| `NEXTAUTH_SECRET` | NextAuth | Session encryption |

---

## Key Design Decisions

- **No session server** — auth state lives in `localStorage.sb_auth`. All pages check this on mount and redirect to `/login` if missing/wrong role.
- **Graceful degradation** — every API route checks for env vars and returns empty/fallback data if not configured. The entire app is browsable with no backend.
- **Static fallbacks** — `/api/materials` has 28 hardcoded products; catalog page works without Supabase.
- **`var` + inline styles** — consistent style used throughout all pages (no CSS files, no Tailwind, no styled-components).
- **`getServerSideProps`** — every page exports `getServerSideProps() { return { props: {} } }` to disable static generation and ensure fresh auth checks.

---

## What Still Needs Supabase Setup

1. Run `supabase/migrations/003_catalog.sql` in Supabase SQL editor to create catalog tables
2. Set `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
3. The `projects` table needs to exist for client login and lead capture to work
4. Run `npm run scrape` after setting env vars to populate catalog with real products
