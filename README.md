# Accounting App Admin

Full-stack ERP accounting application.

- `admin-accounting-frontend` — SvelteKit 2 + Svelte 4 + Tailwind CSS
- `admin-accounting-backend` — Rust + Axum, SQLx/PostgreSQL, Redis, MongoDB audit trail
- `DATABASE_DESIGN.md` — PostgreSQL schema reference

## Quick start with Docker

The root `docker-compose.yml` starts the frontend, backend, PostgreSQL, Redis,
and MongoDB:

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| Backend health | http://localhost:8080/health |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |
| MongoDB | `localhost:27017` |

Stop the stack:

```bash
docker compose down
```

Add `-v` to also remove the PostgreSQL, Redis, and MongoDB volumes.

## Local development

The backend requires PostgreSQL, Redis, and MongoDB. With the Docker
infrastructure running (`docker compose up postgres redis mongo -d`):

```bash
cd admin-accounting-backend
cp .env.example .env
APP_PORT=8081 cargo run --bin admin-accounting-backend
```

Frontend:

```bash
cd admin-accounting-frontend
npm install
cp env_example .env
npm run dev
```

The frontend `.env` should point at the local backend:

```text
VITE_API_BASE_URL=http://localhost:8081
```

Open `http://localhost:5173`. Login is not required. Operational stores start
empty; master data (customers, suppliers, products, COA, warehouses, users,
tax rates, payment terms, and bank accounts) is hydrated from the backend.
There is no frontend mock transaction, inventory, budget, or report data.

The backend applies pending SQLx migrations automatically at startup. If a
migration has already been applied, do not edit it; add a new timestamped
migration instead.

## Transactions and audit

Transaction workflow statuses are shared across both applications:

`draft`, `created`, `approved`, `rejected`, `pending`, `completed`, `reopen`

Every transaction carries an optional `description`/`message`. Editing a
`completed` transaction moves it to `reopen` and records the correction in the
audit trail.

Audit events are stored in MongoDB (`MONGO_AUDIT_COLLECTION`, default
`audit_logs`) and exposed through `/api/audit-logs`. There is no PostgreSQL
audit table.

Pending approval history is stored in PostgreSQL in one
`transaction_<type>_pending` table per transaction type. Each row keeps the
pending, approval, and rejection messages separately. The frontend exposes
Pending/Approve/Reject actions and a history table on transaction detail pages;
the backend API is under `/api/pending`. Schema changes are applied through
SQLx migration files in `admin-accounting-backend/migrations/`.

## Manual journals and financial reports

Financial statements are driven by manual journals, not by sales/purchase
transaction rows. A journal can be saved as a draft, posted, edited, unposted,
and deleted. Only posted (`completed`) journals feed the general ledger, trial
balance, profit & loss, balance sheet, and cash flow reports.

All five reports are realtime by default and refresh from the backend every
30 seconds. A report can be locked for a selected period (`YYYY-MM`); the lock
stores the current payload as a snapshot and returns that snapshot until it is
unlocked. While a period is locked, journal post/unpost/update/delete for that
period is rejected with HTTP `409`.

Journal API:

```text
GET    /api/v1/journals
POST   /api/v1/journals
GET    /api/v1/journals/:id
PUT    /api/v1/journals/:id
DELETE /api/v1/journals/:id
POST   /api/v1/journals/:id/post
POST   /api/v1/journals/:id/unpost
```

Report API:

```text
GET    /api/v1/reports/:report?period=YYYY-MM
GET    /api/v1/reports/:report/lock?period=YYYY-MM
POST   /api/v1/reports/:report/lock
DELETE /api/v1/reports/:report/lock?period=YYYY-MM
```

## Verification

```bash
# Backend
cd admin-accounting-backend
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test

# Frontend
cd admin-accounting-frontend
npm run check
npm run build

# Compose
docker compose config
```

See the README in each application folder for environment variables, API
details, migrations, and Docker notes.
