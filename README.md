# car-garage

Digital platform for car repair shops (_Auto-Werkstatt_). Customers find a
workshop in their city, request an appointment, and — once the workshop confirms
it — describe the vehicle and the problem. The workshop records a diagnosis, a
cost estimate and the parts to repair or replace; after the customer approves the
estimate, the repair proceeds. The whole process is shown to the customer as a
status timeline (_"Fahrzeug wird repariert"_, _"Reparatur abgeschlossen"_, …).

> UI text is German; all code, identifiers, DB fields and comments are English.

---

## Tech stack

| Area          | Choice                                                                  |
| ------------- | --------------------------------------------------------------------- |
| Monorepo      | pnpm workspaces + Turborepo                                          |
| Backend       | Express 5 + TypeScript (ESM), Mongoose 9                             |
| Database      | MongoDB 8, single-node replica set `rs0` (needed for transactions)  |
| Object store  | S3-compatible — MinIO in dev                                        |
| Frontend      | Angular 21 (standalone, signals, OnPush), Tailwind CSS v4, classic NgRx |
| Shared code   | `@car-garage/shared` — framework-agnostic domain enums + API types  |
| Auth          | JWT access tokens (jose, HS256) + rotating opaque refresh tokens    |

The frontend is three separate Angular applications, one per audience, built as
one Angular CLI multi-project workspace.

---

## Repository layout

```
car-garage/
├── apps/
│   ├── api/                     Express + TypeScript API
│   │   ├── server.ts            entry point (creates the app, starts listening)
│   │   ├── app/
│   │   │   ├── index.ts         createApp() — middleware + routes
│   │   │   ├── controllers/     request handlers   ── admin/ · workshop/ · customer/
│   │   │   ├── services/        business logic     ── admin/ + shared domain services
│   │   │   ├── routes/          Express routers    ── admin/ · workshop/ · customer/
│   │   │   ├── dto/             zod request/response schemas
│   │   │   ├── models/          Mongoose models (added per feature, not up front)
│   │   │   ├── helpers/         cross-cutting helpers + error middleware
│   │   │   ├── scripts/         standalone scripts (create-admin, …)
│   │   │   ├── types/ · utils/  API-local types · env + logger
│   │   └── tests/               unit/ + integration/ (supertest, throwaway DB per file)
│   └── web/                     Angular multi-project workspace
│       └── projects/
│           ├── backoffice/      platform admin        → :4200
│           ├── customer/        end users             → :4300
│           └── workshop/        repair shops          → :4400
├── packages/
│   └── shared/                  @car-garage/shared (enums, DTOs, status flows)
├── docker-compose.yml           MongoDB (rs0) + MinIO
└── .env.example
```

### Backend folder conventions

- **Layer-based**, not feature folders. The flow per feature is
  `route → controller → service → model`, with request shapes in `dto/`.
- Inside `controllers/`, `services/` and `routes/`, files are **grouped by
  portal audience** (`admin/`, `workshop/`, `customer/`). Cross-cutting files
  (`auth`, `health`, `routes/index.ts`) stay at the layer root.
- `services/` only has an `admin/` subfolder; the shared domain services
  (`appointment`, `appointment-slot`, `repair-order`, `workshop`,
  `car-catalog`, `user`, `auth`) stay flat because several portals use them.
- **Soft delete project-wide**: a plain `deleted: boolean` field, no plugin, no
  query middleware. Queries filter `deleted: false` explicitly; unique indexes
  use `{ partialFilterExpression: { deleted: false } }`. (`RefreshToken` is the
  one exception — a security credential, hard-deleted on logout/rotation.)

### Frontend folder conventions

Each Angular app follows the same structure: `core/` (config, guards,
interceptors, title strategy), `layout/` (sidebar + topbar shell), `shared/`
(`ui/` presentational components, `utils/`), `Store/` (classic NgRx slices —
verbose multi-file: state/actions/reducer/selectors/effects/facade + the HTTP
data service), and `features/` (routed feature areas, decomposed into small
components under `components/`). Lazy feature routes register their NgRx slice
via `provideState` / `provideEffects`.

---

## Prerequisites

- **Node ≥ 22** (`.nvmrc` → 22)
- **pnpm 9** (`corepack enable`)
- **Docker** (for MongoDB + MinIO)

---

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Environment file (repo root — shared by infra and the API)
cp .env.example .env

# 3. Start infrastructure (MongoDB replica set + MinIO + bucket)
pnpm infra:up          # docker compose up -d

# 4. Build the shared package (the apps consume its dist/)
pnpm --filter @car-garage/shared build

# 5. Create the first platform admin
pnpm --filter @car-garage/api create-admin admin@example.com "SomePassword123!"

# 6. Run everything (API + all three Angular apps) in watch mode
pnpm dev
```

`pnpm dev` runs, via Turborepo:

| App           | URL                     | Purpose                     |
| ------------- | ----------------------- | --------------------------- |
| API           | http://localhost:4000   | REST API under `/api`       |
| Backoffice    | http://localhost:4200   | Platform admin              |
| Customer      | http://localhost:4300   | End users                   |
| Workshop      | http://localhost:4400   | Repair shops                |
| MinIO console | http://localhost:9001   | `minioadmin` / `minioadmin` |
| MongoDB       | `localhost:27018`       | replica set `rs0`           |

To run a single app: `pnpm --filter @car-garage/api dev` or
`pnpm --filter @car-garage/web dev:customer` (likewise `:backoffice`,
`:workshop`).

### Demo credentials

Accounts present in the local dev database (also in `data.txt`):

| Portal     | Login                         | Password        |
| ---------- | ----------------------------- | --------------- |
| Backoffice | `admin@car-garage.test`       | `Passwort123!`  |
| Workshop   | `chef@demo-werkstatt.de`      | `Werkstatt123!` |
| Workshop   | `mechaniker@demo-werkstatt.de` | `Werkstatt123!` |
| Customer   | `kunde@demo.de`               | `Kunde12345!`   |

---

## API

Base URL `http://localhost:4000/api`. Every non-auth route requires a
`Bearer` access token whose `aud` claim matches the portal, so a token issued
for one portal is rejected by another.

| Prefix                        | Audience         | Contains                                                        |
| ----------------------------- | ---------------- | -------------------------------------------------------------- |
| `/auth/<portal>`              | —                | `register` (customer only), `login`, `refresh`, `logout`, `me` |
| `/admin/workshops`            | `PLATFORM_ADMIN` | Workshop CRUD, activate/deactivate, members                   |
| `/admin/car-brands`           | `PLATFORM_ADMIN` | Brand + model catalog, logo upload                            |
| `/admin/customers`            | `PLATFORM_ADMIN` | Customer accounts: list, edit, block/unblock, delete          |
| `/admin/overview` · `/admin/appointments` · `/admin/repair-orders` | `PLATFORM_ADMIN` | Dashboard figures + platform-wide operational lists |
| `/workshop/my-workshop/...`   | workshop staff   | Own profile, availability slots, appointments, repair orders  |
| `/customer/...`               | customer         | Browse workshops (+ radius search), slots, book/cancel appointments, follow repairs, approve/reject the estimate |

Auth: access tokens are short-lived JWTs (`sub`, `aud`, `roles`); refresh
tokens are opaque random strings stored only as SHA-256 hashes, single-use and
rotated on refresh. Passwords use bcrypt. Customers self-register; admin and
workshop accounts are created by a platform admin.

Geo search: `Workshop.location` is a GeoJSON point with a `2dsphere` index;
radius queries use `$geoWithin` / `$centerSphere` (countDocuments-compatible).

---

## Scripts

Run from the repo root (Turborepo fans out to every package):

| Command             | Description                                        |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | API + all three Angular apps, watch mode           |
| `pnpm build`        | Build shared, API and all apps                     |
| `pnpm test`         | Unit + integration tests (needs Docker MongoDB)    |
| `pnpm lint`         | ESLint                                             |
| `pnpm typecheck`    | `tsc --noEmit` across packages                     |
| `pnpm infra:up` / `infra:down` | Start / stop MongoDB + MinIO            |

API-only: `pnpm --filter @car-garage/api <script>` — e.g. `test:unit`,
`test:integration`, `test:watch`, `start`, `create-admin`.
Web-only: `pnpm --filter @car-garage/web <script>` — e.g. `build:customer`,
`dev:workshop`.

---

## Testing

- **API** — Vitest + supertest. `tests/helpers/db.ts` `useTestDatabase()`
  connects Mongoose to a uniquely-named throwaway database per test file (files
  run in parallel processes); the Docker MongoDB must be running.
- **Web** — Vitest per Angular project (`ng test <project> --watch=false`),
  mostly NgRx reducer specs.

---

## Status

Implemented end-to-end (DB → API → UI):

- **Auth** — three portals, login/register/refresh/logout, JWT + role guards.
- **Backoffice** — workshops (CRUD, activation, members), brand/model catalog
  (with logo upload), customer management, real dashboard (platform KPIs,
  pending activations, recent appointments), platform-wide appointment and
  repair-order lists.
- **Workshop portal** — team management, availability slots, appointments
  (list + month calendar, cancel/complete), repair orders (create from an
  appointment, diagnosis + estimate editor, status flow, notes, assignees,
  timeline), own workshop profile.
- **Customer portal** — find a workshop on an interactive map (Leaflet/OSM,
  name/city search, radius search), book an appointment (slot → vehicle →
  problem), "my appointments" (cancel), repairs (approve/reject the estimate,
  status progress + timeline).

Next up: notifications (in-app / e-mail / WebSocket), then reviews,
invoice/PDF, chat, payment and maintenance history.

---

## Notes

Tech decisions in this project are treated as provisional and have changed
before (NestJS → Express, Next.js → Angular, PostgreSQL → MongoDB, Prisma
removed). Keep changes small and reversible.
