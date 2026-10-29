# Accounting Admin SvelteKit

Frontend ERP accounting application built with SvelteKit 2, Svelte 4, and
Tailwind CSS. Operational stores start empty; master data is hydrated from
`admin-accounting-backend` through the live API client. Sales, purchase,
inventory, budgeting, manual journal, and financial report pages all use
backend data. There is no frontend mock transaction or report data.

## Requirements

- Node.js 20+ (Docker image uses Node 24)
- npm 10+

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Environment

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | empty | Backend origin, for example `http://localhost:8081`. Do **not** append `/api`; the client adds `/api/v1`. |
| `HOST` | `0.0.0.0` | Adapter-node bind host |
| `PORT` | `3000` | Adapter-node port |
| `ORIGIN` | `http://localhost:3000` | Public origin used by adapter-node |

When `VITE_API_BASE_URL` is empty the API client records requests in the API
monitor instead of calling the network. Operational stores remain empty and
master-data hydration is skipped, so there is no seeded demo data.

## Scripts

```bash
npm run dev      # development server
npm run check    # svelte-check + TypeScript
npm run build    # production build using @sveltejs/adapter-node
npm run preview  # preview the build
```

The production build output is `build/` and is started with:

```bash
node build
```

The root layout sets `ssr = false` because the dashboard reads browser-only
state (`localStorage`, `window.matchMedia`) and uses Svelte 4 legacy stores.
Adapter-node serves the app shell and SvelteKit hydrates it in the browser.

## Docker

The repository root contains the full-stack Compose file. To build and run the
frontend together with the backend, PostgreSQL, Redis, and MongoDB:

```bash
docker compose up --build
```

The frontend is available at `http://localhost:3000`. The Docker build accepts
`VITE_API_BASE_URL` as a build argument because Vite embeds public environment
variables at build time.

## Audit trail

Every transaction type carries an optional `description` (with `message` as an
alias) through `TransactionMetadata`. Forms copy the value into the audit entry,
and detail pages display it.

New audit entries are written to the local store immediately and, when
`VITE_API_BASE_URL` is configured, posted to the backend:

```text
POST /api/audit-logs
GET  /api/audit-logs?entityType=quotation&entityId=...
```

The backend persists audit events in MongoDB (`MONGO_AUDIT_COLLECTION`,
default `audit_logs`). There is no PostgreSQL audit table.

Transaction workflow statuses are shared across forms, filters, badges, and
reports:

`draft`, `created`, `approved`, `rejected`, `pending`, `completed`, `reopen`.

Editing a `completed` transaction sets it to `reopen` and records the reason in
the audit trail.

## Pending approval

Transaction detail pages render the reusable
`src/lib/components/transactions/PendingApprovalPanel.svelte`. The panel:

- Shows a **Set Pending** button and asks for a pending message.
- Shows **Approve** and **Reject** buttons for `SUPER_ADMIN`, `OWNER`, and
  `ACCOUNTING_ADMIN` users, with separate approval/rejection message popups.
- Shows the full pending history: requester, request time, pending message,
  decision, decision maker, decision time, and decision message.
- Updates the transaction status in the correct local store after each action.

The pending API client is `src/lib/api/pending.ts`:

```text
GET  /api/pending?transactionType=quotation&transactionId=...
POST /api/pending
POST /api/pending/:transactionType/:id/approve
POST /api/pending/:transactionType/:id/reject
```

Pending and audit writes are mirrored to the backend when
`VITE_API_BASE_URL` is configured. In mock mode the same history shape is kept
in the `pendingRequests` store so the UI can be exercised without PostgreSQL.

Expense audit entries use `expense_entry`, while the pending table type is
`expense`; `pendingTransactionTypeFor` and `pendingAuditEntityType` in
`src/lib/data/pending.ts` map between them. `budget_allocation` has no workflow
status in the frontend, so it is not shown in the pending panel.

Bank reconciliation and period closing render the same pending panel inside
their `EntityManager` detail modal, so they have the same Pending/Approve/Reject
flow and history table.

Manual journal entry is a dedicated page at `/journal-entry`. It loads journals
from `/api/v1/journals`, supports multi-line draft/post/edit/delete/unpost, and
shows only posted journals in the financial reports. The general ledger, trial
balance, profit & loss, balance sheet, and cash flow views are realtime
(`30s` auto-refresh) and can lock/unlock a `YYYY-MM` period through
`/api/v1/reports/:report/lock`.
