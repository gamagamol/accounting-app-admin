-- Persist the opening balance entered on the Chart of Accounts master screen.
-- Current ledger balances are still derived from posted journals; this column
-- only stores the opening/current balance that the master-data form exposes.

ALTER TABLE masterdata_coa
    ADD COLUMN IF NOT EXISTS opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0;
