# Admin Accounting Backend

Clean architecture backend for the accounting application, built with **Rust +
Axum**. The folder and layer structure follows the `adm-service` reference
project.

## Stack

- Rust 1.94+ (tested on Rust 1.98)
- Axum 0.8 + Tokio
- SQLx + PostgreSQL
- Redis client (optional until cache/session work starts)
- MongoDB for the immutable audit trail
- `tracing` + `tracing-subscriber` with Rust's default plain-text output
- `validator` for request validation
- In-memory repositories for local development and tests

## Project structure

```text
cmd/
  main.rs                         # binary entrypoint
src/
  lib.rs
  app/
    audit/
      handler/                    # /api/audit-logs HTTP adapter
      repo/                       # memory + MongoDB audit repositories
    pending/
      handler/                    # /api/pending HTTP adapter
      repo/                       # memory + PostgreSQL pending repositories
    container.rs                  # infrastructure dependency wiring
    error.rs                      # HTTP error mapping
    middleware/
      request_logger.rs           # tower-http trace layer
    modules/
      audit.rs                    # audit module composition root
      pending.rs                  # pending module composition root
      user.rs                     # user module composition root
    routes/
      http_routes.rs              # HTTP route registration
    server.rs                     # Axum app + graceful shutdown
    user/
      handler/
        user_handler.rs           # HTTP adapter
        user_handler_dto.rs       # HTTP query DTO
      repo/
        user_repo_memory.rs       # local CRUD repository
        user_repo_postgres.rs     # SQLx repository
  config/
    config.rs                     # environment configuration
  core/
    audit/
      entities/                   # audit entry, changes, domain errors
      interfaces/                 # repository + usecase contracts
      usecases/                   # audit business rules + DTOs
    pending/
      entities/                   # pending request, statuses, table allowlist
      interfaces/                 # repository + usecase contracts
      usecases/                   # pending rules, role checks, DTOs
    user/
      entities/                   # core entity, roles, domain errors
      interfaces/                 # repository + usecase contracts
      usecases/
        user_usecase_impl.rs      # business rules
        dto/                      # request/response DTOs
  infra/
    cache/redis.rs
    database/mongo.rs             # MongoDB client + startup ping
    database/postgres.rs
    logging/logger.rs             # default tracing subscriber
  pkg/
    response/                     # API envelope
    validator/                    # validation helper
migrations/
  20261021000000_create_users.sql
  20261024000000_create_transaction_pending_tables.sql
  README.md
tests/
  audit_crud.rs                   # audit CRUD integration example
  pending_crud.rs                 # pending request/approve/reject integration tests
  user_crud.rs                    # user CRUD integration example
```

## Run locally

The default `DB_DRIVER=memory` and `MONGO_ENABLED=false` do not require
PostgreSQL, Redis, or MongoDB.

```bash
cp .env.example .env
cargo run --bin admin-accounting-backend
```

The API listens on `http://localhost:8080`.

## Environment

| Variable | Default | Notes |
|---|---|---|
| `APP_PORT` | `8080` | HTTP port |
| `DB_DRIVER` | `memory` | `memory` or `postgres` |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |
| `RUST_LOG` | unset | Overrides `LOG_LEVEL` when set |
| `REDIS_ENABLED` | `false` | Set `true` to require Redis on startup |
| `MONGO_ENABLED` | `false` | Set `true` to persist audit events in MongoDB |
| `MONGO_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGO_DATABASE` | `admin_accounting` | Audit database |
| `MONGO_AUDIT_COLLECTION` | `audit_logs` | Audit collection |
| `DB_*` | local defaults | Used when `DB_DRIVER=postgres` |

### Logging

Logging uses `tracing_subscriber::fmt()` with its default text formatter. No
custom log files or JSON layout are configured. Set `RUST_LOG` for per-module
filtering, for example:

```dotenv
RUST_LOG=info,admin_accounting_backend=debug,tower_http=debug
```

## Users API

All responses use the frontend-compatible envelope:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": []
}
```

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List users (`search`, `role`, `page`, `limit`) |
| `GET` | `/api/users/:id` | Get one user |
| `POST` | `/api/users` | Create user |
| `PUT` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |
| `GET` | `/health` | Health check |

Create/update payload matches the frontend `User` type:

```json
{
  "name": "Ahmad Fauzi",
  "email": "ahmad.fauzi@byond.co.id",
  "role": "SUPER_ADMIN",
  "avatar": ""
}
```

Allowed roles: `SUPER_ADMIN`, `SALES_ADMIN`, `ACCOUNTING_ADMIN`, `OWNER`.

## Audit API (MongoDB)

Audit events are **not** stored in PostgreSQL. They are written to the MongoDB
collection configured by `MONGO_AUDIT_COLLECTION` (default `audit_logs`). When
MongoDB is disabled, an in-memory repository is used for local development and
tests.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/audit-logs` | List audit events (`module`, `entityType`, `entityId`, `search`, `page`, `limit`) |
| `GET` | `/api/audit-logs/:id` | Get one audit event |
| `POST` | `/api/audit-logs` | Create an audit event |
| `DELETE` | `/api/audit-logs/:id` | Delete an audit event |
| `DELETE` | `/api/audit-logs/entity/:entityType/:entityId` | Delete all events for an entity |

Create payload:

```json
{
  "module": "sales",
  "entityType": "quotation",
  "entityId": "qt-001",
  "documentNumber": "QUO/2026/001",
  "action": "reopen",
  "status": "reopen",
  "actor": "Ahmad Fauzi",
  "summary": "Reopened completed quotation and recorded a correction.",
  "description": "Customer requested a revised unit price for line 2.",
  "changes": [
    { "field": "status", "before": "completed", "after": "reopen" }
  ]
}
```

`message` is accepted as an alias for `description`. If both are omitted, the
summary is used as the description. Transaction actions are validated against:

`create`, `update`, `delete`, `submit`, `approve`, `reject`, `post`, `void`,
`close`, `reopen`, `export`.

Audit statuses are the same seven transaction workflow statuses:

`draft`, `created`, `approved`, `rejected`, `pending`, `completed`, `reopen`.

## Pending approval API

Pending requests are stored in one PostgreSQL history table per transaction
type, for example `transaction_quotation_pending`. The full table list and
column definitions are in `migrations/README.md`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/pending` | List pending history. Requires `transactionType`; accepts `transactionId`, `status`, `page`, `limit` |
| `POST` | `/api/pending` | Request pending approval |
| `GET` | `/api/pending/:transactionType/:id` | Get one pending row |
| `POST` | `/api/pending/:transactionType/:id/approve` | Approve a pending request |
| `POST` | `/api/pending/:transactionType/:id/reject` | Reject a pending request |

Create payload:

```json
{
  "transactionType": "quotation",
  "transactionId": "qt-001",
  "transactionNumber": "QUO/2026/001",
  "requestedBy": "Ahmad Fauzi",
  "pendingMessage": "Customer requested a revised unit price.",
  "actorRole": "SALES_ADMIN"
}
```

Approve payload:

```json
{
  "actor": "Dewi Sartika",
  "actorRole": "OWNER",
  "decisionMessage": "Approved after checking the margin."
}
```

Reject uses the same payload with a rejection reason. `message` is accepted as
an alias for `pendingMessage` and `decisionMessage`.

Approver roles are `SUPER_ADMIN`, `OWNER`, and `ACCOUNTING_ADMIN`. Only one
`pending` row can exist per transaction at a time; a second request returns
`409 Conflict`. Pending statuses are `pending`, `approved`, and `rejected`.

Supported transaction types:

```text
quotation, sales_order, purchase_order, delivery_order, goods_receipt,
sales_invoice, customer_receipt, vendor_payment, debt_payment,
purchase_invoice, sales_return, purchase_return, stock_movement,
stock_adjustment, annual_budget, budget_allocation, budget_revision,
expense, journal_entry, bank_reconciliation, period_closing
```

## PostgreSQL, Redis, and MongoDB

Start the optional local services:

```bash
docker compose up -d
```

Then set:

```dotenv
DB_DRIVER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=admin_accounting
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSLMODE=disable
REDIS_ENABLED=true
MONGO_ENABLED=true
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=admin_accounting
MONGO_AUDIT_COLLECTION=audit_logs
```

SQLx runs the embedded migrations from `migrations/` at startup. See
`migrations/README.md` for naming and audit storage notes.

## Docker

The repository root contains the full-stack Compose file (frontend, backend,
PostgreSQL, Redis, MongoDB):

```bash
docker compose up --build
```

The backend image is built from this folder's `Dockerfile`; the frontend image
uses the sibling `admin-accounting-frontend` folder. Both `.env` files are
optional because Compose supplies service hostnames and defaults.

## Verification

```bash
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
```

The integration tests use the in-memory repositories, so no database is
required. `tests/audit_crud.rs` is a complete CRUD example for the audit module;
`tests/pending_crud.rs` covers request, history, duplicate prevention, approve,
reject, validation, role checks, and not-found responses; `tests/user_crud.rs`
covers the user CRUD and health endpoint.

## Next modules

A new module can follow the same layers:

```text
core/<module>/{entities,interfaces,usecases}
app/<module>/{handler,repo}
app/modules/<module>.rs
```

The payload should match the corresponding frontend type.
