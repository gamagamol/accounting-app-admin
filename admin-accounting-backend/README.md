# Admin Accounting Backend

Clean architecture boilerplate for the accounting application backend.
The folder and layer structure follows the `adm-service` reference project, but
this implementation uses **Rust + Axum** instead of the reference stack.

## Stack

- Rust 1.94+ (tested on Rust 1.98)
- Axum 0.8
- Tokio
- SQLx + PostgreSQL
- Redis client (optional until cache/session work starts)
- `tracing` + `tracing-subscriber` structured logging
- `validator` for request validation
- In-memory user repository for local development

## Project structure

```text
cmd/
  main.rs                         # binary entrypoint
src/
  lib.rs
  app/
    container.rs                  # infrastructure dependency wiring
    error.rs                      # HTTP error mapping
    middleware/
      request_logger.rs           # tower-http trace layer
    modules/
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
    user/
      entities/                   # core entity, roles, domain errors
      interfaces/                 # repository + usecase contracts
      usecases/
        user_usecase_impl.rs      # business rules
        dto/                      # request/response DTOs
  infra/
    cache/redis.rs
    database/postgres.rs
    logging/logger.rs
  pkg/
    response/                     # API envelope
    validator/                    # validation helper
migrations/
  20261021000000_create_users.sql
tests/
  user_crud.rs
```

## Run locally

The default `DB_DRIVER=memory` does not require Postgres or Redis.

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
| `LOG_FORMAT` | `json` | `json` or `text` |
| `REDIS_ENABLED` | `false` | Set `true` to require Redis on startup |
| `DB_*` | local defaults | Used when `DB_DRIVER=postgres` |

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

### Quick check

```bash
curl http://localhost:8080/api/users

curl -X POST http://localhost:8080/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@byond.co.id","role":"SALES_ADMIN","avatar":""}'
```

## Postgres and Redis

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
```

SQLx runs the embedded migrations from `migrations/` at startup.

## Verification

```bash
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
```

## Next modules

`product` can follow the same layers:

```text
core/product/{entities,interfaces,usecases}
app/product/{handler,repo}
app/modules/product.rs
```

The payload should match the frontend `Product` type.
