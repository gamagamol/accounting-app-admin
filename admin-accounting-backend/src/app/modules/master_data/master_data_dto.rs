use serde::Serialize;

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct SelectOption {
    pub id: i64,
    pub code: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomerOption {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub payment_term_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductOption {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub uom_id: i64,
    pub uom_name: Option<String>,
    pub selling_price: f64,
    pub cost_price: f64,
    pub category_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TaxRateOption {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub rate: f64,
    pub tax_type: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentTermOption {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub days: i32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BankAccountOption {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub coa_id: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CostCenterOption {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub department_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CoaOption {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub account_type: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MasterDataOptions {
    pub customers: Vec<CustomerOption>,
    pub suppliers: Vec<SelectOption>,
    pub products: Vec<ProductOption>,
    pub warehouses: Vec<SelectOption>,
    pub uoms: Vec<SelectOption>,
    pub tax_rates: Vec<TaxRateOption>,
    pub payment_terms: Vec<PaymentTermOption>,
    pub bank_accounts: Vec<BankAccountOption>,
    pub departments: Vec<SelectOption>,
    pub cost_centers: Vec<CostCenterOption>,
    pub coa: Vec<CoaOption>,
    pub users: Vec<SelectOption>,
}
