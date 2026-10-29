-- Include unclosed profit/loss in equity so the balance sheet equation holds:
-- assets = liabilities + equity + current period earnings.
CREATE OR REPLACE VIEW report_balance_sheet AS
SELECT
    account_type,
    account_code,
    account_name,
    CASE WHEN account_type IN ('liability', 'equity') THEN -balance ELSE balance END AS balance
FROM report_trial_balance
WHERE account_type IN ('asset', 'liability', 'equity')
UNION ALL
SELECT
    'equity'::varchar(20) AS account_type,
    '399'::varchar(20) AS account_code,
    'CURRENT PERIOD EARNINGS'::varchar(150) AS account_name,
    -COALESCE(SUM(balance), 0) AS balance
FROM report_trial_balance
WHERE account_type IN ('revenue', 'expense');
