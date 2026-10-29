use async_trait::async_trait;
use sqlx::{FromRow, PgPool};

use super::master_data_dto::{
    BankAccountOption, CoaOption, CostCenterOption, CustomerOption, MasterDataOptions,
    PaymentTermOption, ProductOption, SelectOption, TaxRateOption,
};
use super::master_data_interface::IMasterDataRepo;

pub struct MasterDataRepo {
    pool: PgPool,
}

impl MasterDataRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(Debug, FromRow)]
struct CustomerRow {
    id: i64,
    code: String,
    name: String,
    payment_term_id: Option<i64>,
}

#[derive(Debug, FromRow)]
struct ProductRow {
    id: i64,
    code: String,
    name: String,
    uom_id: i64,
    uom_name: Option<String>,
    selling_price: f64,
    cost_price: f64,
    category_id: Option<i64>,
}

#[derive(Debug, FromRow)]
struct TaxRateRow {
    id: i64,
    code: String,
    name: String,
    rate: f64,
    tax_type: String,
}

#[derive(Debug, FromRow)]
struct PaymentTermRow {
    id: i64,
    code: String,
    name: String,
    days: i32,
}

#[derive(Debug, FromRow)]
struct BankAccountRow {
    id: i64,
    code: String,
    name: String,
    coa_id: i64,
}

#[derive(Debug, FromRow)]
struct CostCenterRow {
    id: i64,
    code: String,
    name: String,
    department_id: Option<i64>,
}

#[derive(Debug, FromRow)]
struct CoaRow {
    id: i64,
    code: String,
    name: String,
    account_type: String,
}

#[async_trait]
impl IMasterDataRepo for MasterDataRepo {
    async fn options(&self) -> Result<MasterDataOptions, String> {
        let customers = sqlx::query_as::<_, CustomerRow>(
            "SELECT id, customer_code AS code, company_name AS name, payment_term_id
             FROM masterdata_customer
             WHERE status = 'active'
             ORDER BY company_name",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|row| CustomerOption {
            id: row.id,
            code: row.code,
            name: row.name,
            payment_term_id: row.payment_term_id,
        })
        .collect();

        let suppliers = sqlx::query_as::<_, SelectOption>(
            "SELECT id, supplier_code AS code, company_name AS name
             FROM masterdata_supplier
             WHERE status = 'active'
             ORDER BY company_name",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        let products = sqlx::query_as::<_, ProductRow>(
            "SELECT p.id, p.product_code AS code, p.name, p.base_uom_id AS uom_id,
                    u.name AS uom_name, p.selling_price::float8 AS selling_price,
                    p.cost_price::float8 AS cost_price, p.category_id
             FROM masterdata_product p
             LEFT JOIN masterdata_uom u ON u.id = p.base_uom_id
             WHERE p.status = 'active'
             ORDER BY p.name",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|row| ProductOption {
            id: row.id,
            code: row.code,
            name: row.name,
            uom_id: row.uom_id,
            uom_name: row.uom_name,
            selling_price: row.selling_price,
            cost_price: row.cost_price,
            category_id: row.category_id,
        })
        .collect();

        let warehouses = sqlx::query_as::<_, SelectOption>(
            "SELECT id, code, name FROM masterdata_warehouse WHERE status = 'active' ORDER BY name",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        let uoms = sqlx::query_as::<_, SelectOption>(
            "SELECT id, code, name FROM masterdata_uom WHERE is_active = TRUE ORDER BY name",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        let tax_rates = sqlx::query_as::<_, TaxRateRow>(
            "SELECT id, code, name, rate::float8 AS rate, tax_type
             FROM masterdata_tax_rate
             WHERE is_active = TRUE
             ORDER BY name",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|row| TaxRateOption {
            id: row.id,
            code: row.code,
            name: row.name,
            rate: row.rate,
            tax_type: row.tax_type,
        })
        .collect();

        let payment_terms = sqlx::query_as::<_, PaymentTermRow>(
            "SELECT id, code, name, days
             FROM masterdata_payment_term
             WHERE is_active = TRUE
             ORDER BY days",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|row| PaymentTermOption {
            id: row.id,
            code: row.code,
            name: row.name,
            days: row.days,
        })
        .collect();

        let bank_accounts = sqlx::query_as::<_, BankAccountRow>(
            "SELECT id, code, bank_name AS name, coa_id
             FROM masterdata_bank_account
             WHERE status = 'active'
             ORDER BY bank_name",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|row| BankAccountOption {
            id: row.id,
            code: row.code,
            name: row.name,
            coa_id: row.coa_id,
        })
        .collect();

        let departments = sqlx::query_as::<_, SelectOption>(
            "SELECT id, code, name FROM masterdata_department WHERE status = 'active' ORDER BY name",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        let cost_centers = sqlx::query_as::<_, CostCenterRow>(
            "SELECT id, code, name, department_id
             FROM masterdata_cost_center
             WHERE status = 'active'
             ORDER BY name",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|row| CostCenterOption {
            id: row.id,
            code: row.code,
            name: row.name,
            department_id: row.department_id,
        })
        .collect();

        let coa = sqlx::query_as::<_, CoaRow>(
            "SELECT id, account_code AS code, account_name AS name, account_type
             FROM masterdata_coa
             WHERE is_active = TRUE AND is_header = FALSE
             ORDER BY account_code",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|row| CoaOption {
            id: row.id,
            code: row.code,
            name: row.name,
            account_type: row.account_type,
        })
        .collect();

        let users = sqlx::query_as::<_, SelectOption>(
            "SELECT id, username AS code, name FROM masterdata_user WHERE status = 'active' ORDER BY name",
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(MasterDataOptions {
            customers,
            suppliers,
            products,
            warehouses,
            uoms,
            tax_rates,
            payment_terms,
            bank_accounts,
            departments,
            cost_centers,
            coa,
            users,
        })
    }
}
