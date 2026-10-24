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

Backend:

```bash
cd admin-accounting-backend
cp .env.example .env
cargo run --bin admin-accounting-backend
```

Frontend:

```bash
cd admin-accounting-frontend
npm install
cp .env.example .env
npm run dev
```

The backend defaults to `DB_DRIVER=memory` with Redis and MongoDB disabled, so
it runs without external services. Set `VITE_API_BASE_URL` in the frontend
`.env` to connect to it.

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
