use async_trait::async_trait;
use serde_json::Value;

use crate::pkg::response::response_error::AppError;

/// Every master-data table exposed by the unified CRUD endpoint.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MasterDataEntity {
    Products,
    Customers,
    Suppliers,
    Employees,
    Departments,
    CostCenters,
    ChartOfAccounts,
    Warehouses,
    TaxRates,
    PaymentTerms,
    BankAccounts,
    Uoms,
    ProductCategories,
    PayrollComponents,
    AppConfigs,
    ProductAccountMappings,
    CompanyProfile,
}

impl MasterDataEntity {
    pub fn parse(value: &str) -> Option<Self> {
        let normalized = value.trim().to_ascii_lowercase().replace('_', "-");
        match normalized.as_str() {
            "products" | "product" => Some(Self::Products),
            "customers" | "customer" => Some(Self::Customers),
            "suppliers" | "supplier" => Some(Self::Suppliers),
            "employees" | "employee" => Some(Self::Employees),
            "departments" | "department" => Some(Self::Departments),
            "cost-centers" | "cost-center" | "costcenters" | "costcenter" => {
                Some(Self::CostCenters)
            }
            "coa" | "chart-of-accounts" | "chart-of-account" | "accounts" => {
                Some(Self::ChartOfAccounts)
            }
            "warehouses" | "warehouse" => Some(Self::Warehouses),
            "tax-rates" | "tax-rate" | "taxrates" | "taxrate" => Some(Self::TaxRates),
            "payment-terms" | "payment-term" | "paymentterms" | "paymentterm" => {
                Some(Self::PaymentTerms)
            }
            "bank-accounts" | "bank-account" | "bankaccounts" | "bankaccount" => {
                Some(Self::BankAccounts)
            }
            "uoms" | "uom" | "units" | "unit" | "units-of-measurement" => Some(Self::Uoms),
            "product-categories" | "product-category" | "categories" | "category" => {
                Some(Self::ProductCategories)
            }
            "payroll-components" | "payroll-component" | "payrollcomponents" => {
                Some(Self::PayrollComponents)
            }
            "app-configs" | "app-config" | "appconfigs" | "configs" | "config" => {
                Some(Self::AppConfigs)
            }
            "product-account-mappings"
            | "product-account-mapping"
            | "account-mappings"
            | "mappings" => Some(Self::ProductAccountMappings),
            "company-profile" | "companyprofile" | "company" => Some(Self::CompanyProfile),
            _ => None,
        }
    }

    pub fn slug(&self) -> &'static str {
        match self {
            Self::Products => "products",
            Self::Customers => "customers",
            Self::Suppliers => "suppliers",
            Self::Employees => "employees",
            Self::Departments => "departments",
            Self::CostCenters => "cost-centers",
            Self::ChartOfAccounts => "coa",
            Self::Warehouses => "warehouses",
            Self::TaxRates => "tax-rates",
            Self::PaymentTerms => "payment-terms",
            Self::BankAccounts => "bank-accounts",
            Self::Uoms => "uoms",
            Self::ProductCategories => "product-categories",
            Self::PayrollComponents => "payroll-components",
            Self::AppConfigs => "app-configs",
            Self::ProductAccountMappings => "product-account-mappings",
            Self::CompanyProfile => "company-profile",
        }
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            Self::Products => "product",
            Self::Customers => "customer",
            Self::Suppliers => "supplier",
            Self::Employees => "employee",
            Self::Departments => "department",
            Self::CostCenters => "cost center",
            Self::ChartOfAccounts => "chart of account",
            Self::Warehouses => "warehouse",
            Self::TaxRates => "tax rate",
            Self::PaymentTerms => "payment term",
            Self::BankAccounts => "bank account",
            Self::Uoms => "unit of measurement",
            Self::ProductCategories => "product category",
            Self::PayrollComponents => "payroll component",
            Self::AppConfigs => "application configuration",
            Self::ProductAccountMappings => "product account mapping",
            Self::CompanyProfile => "company profile",
        }
    }
}

#[async_trait]
pub trait IMasterDataCrudRepo: Send + Sync {
    async fn list(&self, entity: MasterDataEntity) -> Result<Vec<Value>, AppError>;
    async fn get(&self, entity: MasterDataEntity, id: i64) -> Result<Option<Value>, AppError>;
    async fn create(&self, entity: MasterDataEntity, payload: Value) -> Result<Value, AppError>;
    async fn update(
        &self,
        entity: MasterDataEntity,
        id: i64,
        payload: Value,
    ) -> Result<Option<Value>, AppError>;
    async fn delete(&self, entity: MasterDataEntity, id: i64) -> Result<bool, AppError>;
}

#[async_trait]
pub trait IMasterDataCrudUsecase: Send + Sync {
    async fn list(&self, entity: MasterDataEntity) -> Result<Vec<Value>, AppError>;
    async fn get(&self, entity: MasterDataEntity, id: i64) -> Result<Value, AppError>;
    async fn create(&self, entity: MasterDataEntity, payload: Value) -> Result<Value, AppError>;
    async fn update(
        &self,
        entity: MasterDataEntity,
        id: i64,
        payload: Value,
    ) -> Result<Value, AppError>;
    async fn delete(&self, entity: MasterDataEntity, id: i64) -> Result<(), AppError>;
}
