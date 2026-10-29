-- Remove the legacy "PT Ibaraki" placeholder from master data.
-- Only replace the old literal so user-edited company names are preserved.

UPDATE masterdata_company_profile
SET company_name = 'Nama Perusahaan',
    updated_at = now()
WHERE company_name = 'PT Ibaraki';

UPDATE masterdata_bank_account
SET account_holder = 'Nama Perusahaan',
    updated_at = now()
WHERE account_holder = 'PT Ibaraki';

UPDATE masterdata_config
SET config_value = '"Nama Perusahaan"'::jsonb,
    updated_at = now()
WHERE config_key = 'company.name'
  AND config_value = '"PT Ibaraki"'::jsonb;
