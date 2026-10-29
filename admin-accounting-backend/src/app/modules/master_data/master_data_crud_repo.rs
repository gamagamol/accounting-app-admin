use async_trait::async_trait;
use chrono::NaiveDate;
use serde_json::{Number, Value};
use sqlx::PgPool;

use super::master_data_crud_interface::{IMasterDataCrudRepo, MasterDataEntity};
use crate::pkg::response::response_error::AppError;

pub struct MasterDataCrudRepo {
    pool: PgPool,
}

impl MasterDataCrudRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    async fn next_code(&self, table: &str, prefix: &str) -> Result<String, AppError> {
        let sql = format!("SELECT COALESCE(MAX(id), 0) + 1 FROM {table}");
        let next: i64 = sqlx::query_scalar(sqlx::AssertSqlSafe(sql))
            .fetch_one(&self.pool)
            .await
            .map_err(db_error)?;
        Ok(format!("{prefix}{next:03}"))
    }

    async fn set_stock(
        &self,
        product_id: i64,
        quantity: f64,
        average_cost: f64,
    ) -> Result<(), AppError> {
        sqlx::query(
            "INSERT INTO inventory_stock_balance
                (product_id, warehouse_id, quantity_on_hand, quantity_reserved, average_cost, last_movement_at, updated_at)
             SELECT $1, w.id, $2, 0, $3, now(), now()
             FROM masterdata_warehouse w
             WHERE w.status = 'active'
             ORDER BY w.id
             LIMIT 1
             ON CONFLICT (product_id, warehouse_id) DO UPDATE
             SET quantity_on_hand = EXCLUDED.quantity_on_hand,
                 average_cost = EXCLUDED.average_cost,
                 last_movement_at = now(),
                 updated_at = now()",
        )
        .bind(product_id)
        .bind(quantity.max(0.0))
        .bind(average_cost.max(0.0))
        .execute(&self.pool)
        .await
        .map_err(db_error)?;
        Ok(())
    }
}

#[async_trait]
impl IMasterDataCrudRepo for MasterDataCrudRepo {
    async fn list(&self, entity: MasterDataEntity) -> Result<Vec<Value>, AppError> {
        let sql = format!("SELECT row_to_json(t) FROM ({}) t", list_sql(entity));
        sqlx::query_scalar::<_, Value>(sqlx::AssertSqlSafe(sql))
            .fetch_all(&self.pool)
            .await
            .map_err(db_error)
    }

    async fn get(&self, entity: MasterDataEntity, id: i64) -> Result<Option<Value>, AppError> {
        let sql = format!(
            "SELECT row_to_json(t) FROM ({}) t WHERE t.id = $1",
            list_sql(entity)
        );
        sqlx::query_scalar::<_, Value>(sqlx::AssertSqlSafe(sql))
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(db_error)
    }

    async fn create(&self, entity: MasterDataEntity, payload: Value) -> Result<Value, AppError> {
        let id = match entity {
            MasterDataEntity::Products => {
                let name = require_str(&payload, "name")?;
                let item_type = as_string(&payload, "itemType").unwrap_or_else(|| "goods".into());
                if !matches!(item_type.as_str(), "goods" | "service") {
                    return Err(AppError::BadRequest(
                        "itemType must be either goods or service".into(),
                    ));
                }
                let base_uom_id = resolve_uom(
                    &self.pool,
                    as_string(&payload, "unit").as_deref(),
                    as_i64(&payload, "unitId"),
                )
                .await?
                .ok_or_else(|| AppError::BadRequest("unit is required".into()))?;
                let category_id = resolve_category(
                    &self.pool,
                    as_string(&payload, "category").as_deref(),
                    as_i64(&payload, "categoryId"),
                )
                .await?;
                let secondary_uom_id = resolve_uom(
                    &self.pool,
                    as_string(&payload, "secondaryUnit").as_deref(),
                    as_i64(&payload, "secondaryUnitId"),
                )
                .await?;
                let product_code = as_string(&payload, "code")
                    .or_else(|| as_string(&payload, "productCode"))
                    .unwrap_or(self.next_code("masterdata_product", "PRD-").await?);
                let conversion_rate = as_f64(&payload, "conversionRate")
                    .filter(|value| *value > 0.0)
                    .unwrap_or(1.0);
                let weight_kg = as_f64(&payload, "weightKg").unwrap_or(0.0).max(0.0);
                let barcode = as_string(&payload, "barcode");
                let selling_price = as_f64(&payload, "price")
                    .or_else(|| as_f64(&payload, "sellingPrice"))
                    .unwrap_or(0.0)
                    .max(0.0);
                let cost_price = as_f64(&payload, "costPrice").unwrap_or(0.0).max(0.0);
                let min_stock = as_f64(&payload, "minStock").unwrap_or(0.0).max(0.0);
                let description = as_string(&payload, "description");
                let status = normalize_status(as_string(&payload, "status"));

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_product
                        (product_code, name, item_type, category_id, base_uom_id, secondary_uom_id,
                         conversion_rate, weight_kg, barcode, selling_price, cost_price, min_stock,
                         description, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                     RETURNING id",
                )
                .bind(&product_code)
                .bind(&name)
                .bind(&item_type)
                .bind(category_id)
                .bind(base_uom_id)
                .bind(secondary_uom_id)
                .bind(conversion_rate)
                .bind(weight_kg)
                .bind(barcode)
                .bind(selling_price)
                .bind(cost_price)
                .bind(min_stock)
                .bind(description)
                .bind(&status)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;

                if item_type == "goods"
                    && let Some(stock) = as_f64(&payload, "stock")
                {
                    self.set_stock(id, stock, cost_price).await?;
                }
                id
            }
            MasterDataEntity::Customers => {
                let company_name = require_str(&payload, "companyName")?;
                let nb = as_string(&payload, "nb");
                let customer_code = as_string(&payload, "customerCode")
                    .or_else(|| as_string(&payload, "code"))
                    .or_else(|| nb.clone())
                    .unwrap_or(self.next_code("masterdata_customer", "CUST-").await?);
                let payment_term_id = resolve_payment_term(&self.pool, &payload).await?;
                let status = normalize_status(as_string(&payload, "status"));

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_customer
                        (customer_code, company_name, city, contact_person, email, phone, nb, npwp,
                         npwp_address, address, payment_term_id, notes, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                     RETURNING id",
                )
                .bind(&customer_code)
                .bind(&company_name)
                .bind(as_string(&payload, "city"))
                .bind(as_string(&payload, "contactPerson"))
                .bind(as_string(&payload, "email"))
                .bind(as_string(&payload, "phone"))
                .bind(nb)
                .bind(as_string(&payload, "npwp"))
                .bind(as_string(&payload, "npwpAddress"))
                .bind(as_string(&payload, "address"))
                .bind(payment_term_id)
                .bind(as_string(&payload, "notes"))
                .bind(&status)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::Suppliers => {
                let company_name = require_str(&payload, "companyName")?;
                let supplier_code = as_string(&payload, "supplierCode")
                    .or_else(|| as_string(&payload, "code"))
                    .unwrap_or(self.next_code("masterdata_supplier", "SUP-").await?);
                let payment_term_id = resolve_payment_term(&self.pool, &payload).await?;
                let status = normalize_status(as_string(&payload, "status"));

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_supplier
                        (supplier_code, company_name, contact_person, email, phone, address, city,
                         npwp, payment_term_id, notes, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                     RETURNING id",
                )
                .bind(&supplier_code)
                .bind(&company_name)
                .bind(as_string(&payload, "contactPerson"))
                .bind(as_string(&payload, "email"))
                .bind(as_string(&payload, "phone"))
                .bind(as_string(&payload, "address"))
                .bind(as_string(&payload, "city"))
                .bind(as_string(&payload, "npwp"))
                .bind(payment_term_id)
                .bind(as_string(&payload, "notes"))
                .bind(&status)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::Employees => {
                let name = require_str(&payload, "name")?;
                let position = require_str(&payload, "position")?;
                let employee_number = as_string(&payload, "employeeNumber")
                    .or_else(|| as_string(&payload, "code"))
                    .unwrap_or(self.next_code("masterdata_employee", "EMP-").await?);
                let department_id = resolve_department(
                    &self.pool,
                    as_string(&payload, "department").as_deref(),
                    as_i64(&payload, "departmentId"),
                )
                .await?;
                let cost_center_id = resolve_cost_center(
                    &self.pool,
                    as_string(&payload, "costCenter").as_deref(),
                    as_i64(&payload, "costCenterId"),
                )
                .await?;
                let hire_date = as_string(&payload, "hireDate")
                    .and_then(|value| NaiveDate::parse_from_str(&value, "%Y-%m-%d").ok());
                let status = normalize_employee_status(as_string(&payload, "status"));

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_employee
                        (employee_number, name, position, department_id, cost_center_id, email, phone,
                         address, hire_date, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     RETURNING id",
                )
                .bind(&employee_number)
                .bind(&name)
                .bind(&position)
                .bind(department_id)
                .bind(cost_center_id)
                .bind(as_string(&payload, "email"))
                .bind(as_string(&payload, "phone"))
                .bind(as_string(&payload, "address"))
                .bind(hire_date)
                .bind(&status)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::Departments => {
                let code = require_str(&payload, "code")?;
                let name = require_str(&payload, "name")?;
                let manager_employee_id = resolve_employee(
                    &self.pool,
                    as_string(&payload, "manager").as_deref(),
                    as_i64(&payload, "managerEmployeeId"),
                )
                .await?;
                let status = normalize_status(as_string(&payload, "status"));

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_department
                        (code, name, manager_employee_id, status)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id",
                )
                .bind(&code)
                .bind(&name)
                .bind(manager_employee_id)
                .bind(&status)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;

                assign_department_cost_center(
                    &self.pool,
                    id,
                    as_string(&payload, "costCenter").as_deref(),
                )
                .await?;
                id
            }
            MasterDataEntity::CostCenters => {
                let code = require_str(&payload, "code")?;
                let name = require_str(&payload, "name")?;
                let department_id = resolve_department(
                    &self.pool,
                    as_string(&payload, "department").as_deref(),
                    as_i64(&payload, "departmentId"),
                )
                .await?;
                let status = normalize_status(as_string(&payload, "status"));

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_cost_center (code, name, department_id, status)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id",
                )
                .bind(&code)
                .bind(&name)
                .bind(department_id)
                .bind(&status)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::ChartOfAccounts => {
                let code = require_str(&payload, "code")?;
                let name = require_str(&payload, "name")?;
                let account_type = account_type(&payload)?;
                let normal_balance = normal_balance(&payload, &account_type);
                let opening_balance = as_f64(&payload, "balance").unwrap_or(0.0);
                let is_header = as_bool(&payload, "isHeader").unwrap_or(false);
                let is_active = as_bool(&payload, "isActive").unwrap_or(true);

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_coa
                        (account_code, account_name, account_type, normal_balance, parent_id,
                         is_header, is_active, opening_balance)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING id",
                )
                .bind(&code)
                .bind(&name)
                .bind(&account_type)
                .bind(&normal_balance)
                .bind(as_i64(&payload, "parentId"))
                .bind(is_header)
                .bind(is_active)
                .bind(opening_balance)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::Warehouses => {
                let code = require_str(&payload, "code")?;
                let name = require_str(&payload, "name")?;
                let manager_employee_id = resolve_employee(
                    &self.pool,
                    as_string(&payload, "manager").as_deref(),
                    as_i64(&payload, "managerEmployeeId"),
                )
                .await?;
                let capacity = as_f64(&payload, "capacity").unwrap_or(0.0).max(0.0);
                let status = normalize_status(as_string(&payload, "status"));

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_warehouse
                        (code, name, location, manager_employee_id, capacity, status)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING id",
                )
                .bind(&code)
                .bind(&name)
                .bind(as_string(&payload, "location"))
                .bind(manager_employee_id)
                .bind(capacity)
                .bind(&status)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::TaxRates => {
                let code = require_str(&payload, "code")?;
                let name = require_str(&payload, "name")?;
                let rate = as_f64(&payload, "rate")
                    .ok_or_else(|| AppError::BadRequest("rate is required".into()))?;
                if !(0.0..=100.0).contains(&rate) {
                    return Err(AppError::BadRequest(
                        "rate must be between 0 and 100".into(),
                    ));
                }
                let tax_type = tax_type(&payload)?;
                let is_active = as_bool(&payload, "isActive").unwrap_or(true);

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_tax_rate
                        (code, name, rate, tax_type, description, is_active)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING id",
                )
                .bind(&code)
                .bind(&name)
                .bind(rate)
                .bind(&tax_type)
                .bind(as_string(&payload, "description"))
                .bind(is_active)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::PaymentTerms => {
                let code = require_str(&payload, "code")?;
                let name = require_str(&payload, "name")?;
                let days = as_i64(&payload, "days").unwrap_or(0).max(0);
                let is_active = as_bool(&payload, "isActive").unwrap_or(true);

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_payment_term
                        (code, name, days, description, is_active)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id",
                )
                .bind(&code)
                .bind(&name)
                .bind(days as i32)
                .bind(as_string(&payload, "description"))
                .bind(is_active)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::BankAccounts => {
                let code = require_str(&payload, "code")?;
                let bank_name = require_str(&payload, "bankName")?;
                let account_number = as_string(&payload, "accountNumber")
                    .unwrap_or_else(|| format!("ACC-{}", chrono::Utc::now().timestamp_millis()));
                let account_holder = as_string(&payload, "accountHolder")
                    .unwrap_or_else(|| "Nama Perusahaan".into());
                let currency = as_string(&payload, "currency")
                    .unwrap_or_else(|| "IDR".into())
                    .to_ascii_uppercase();
                let coa_id = match as_i64(&payload, "coaId") {
                    Some(id) => id,
                    None => default_bank_coa(&self.pool).await?,
                };
                let balance = as_f64(&payload, "balance").unwrap_or(0.0);
                let status = normalize_status(as_string(&payload, "status"));

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_bank_account
                        (code, bank_name, account_number, account_holder, currency_code, coa_id,
                         opening_balance, current_balance, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
                     RETURNING id",
                )
                .bind(&code)
                .bind(&bank_name)
                .bind(&account_number)
                .bind(&account_holder)
                .bind(&currency)
                .bind(coa_id)
                .bind(balance)
                .bind(&status)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::Uoms => {
                let code = require_str(&payload, "code")?;
                let name = require_str(&payload, "name")?;
                let category = uom_category(&payload)?;
                let is_active = as_bool(&payload, "isActive").unwrap_or(true);

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_uom (code, name, category, description, is_active)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id",
                )
                .bind(&code)
                .bind(&name)
                .bind(&category)
                .bind(as_string(&payload, "description"))
                .bind(is_active)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::ProductCategories => {
                let code = require_str(&payload, "code")?;
                let name = require_str(&payload, "name")?;

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_product_category (code, name, description)
                     VALUES ($1, $2, $3)
                     RETURNING id",
                )
                .bind(&code)
                .bind(&name)
                .bind(as_string(&payload, "description"))
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::PayrollComponents => {
                let code = require_str(&payload, "code")?;
                let name = require_str(&payload, "name")?;
                let component_type = component_type(&payload)?;
                let taxable = as_bool(&payload, "taxable").unwrap_or(true);
                let coa_id = resolve_coa(
                    &self.pool,
                    as_string(&payload, "coaCode")
                        .or_else(|| as_string(&payload, "coa"))
                        .as_deref(),
                    as_i64(&payload, "coaId"),
                )
                .await?
                .ok_or_else(|| AppError::BadRequest("COA account is required".into()))?;
                let is_active = as_bool(&payload, "isActive").unwrap_or(true);

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_payroll_component
                        (code, name, component_type, taxable, coa_id, is_active)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING id",
                )
                .bind(&code)
                .bind(&name)
                .bind(&component_type)
                .bind(taxable)
                .bind(coa_id)
                .bind(is_active)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::AppConfigs => {
                let key = as_string(&payload, "key")
                    .or_else(|| as_string(&payload, "configKey"))
                    .ok_or_else(|| AppError::BadRequest("key is required".into()))?;
                let data_type = data_type(&payload);
                let config_value = config_value(&payload, None, &data_type);
                let is_public = as_bool(&payload, "isPublic").unwrap_or(false);
                let is_editable = as_bool(&payload, "isEditable").unwrap_or(true);

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_config
                        (config_key, config_value, config_group, data_type, description, is_public,
                         is_editable)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING id",
                )
                .bind(&key)
                .bind(config_value)
                .bind(as_string(&payload, "group").unwrap_or_else(|| "general".into()))
                .bind(&data_type)
                .bind(as_string(&payload, "description"))
                .bind(is_public)
                .bind(is_editable)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::ProductAccountMappings => {
                let product_category_id = resolve_category(
                    &self.pool,
                    as_string(&payload, "category").as_deref(),
                    as_i64(&payload, "productCategoryId"),
                )
                .await?
                .ok_or_else(|| AppError::BadRequest("category is required".into()))?;
                let inventory_account_id = required_coa(
                    &self.pool,
                    &payload,
                    "inventoryAccount",
                    "inventoryAccountId",
                )
                .await?;
                let sales_account_id =
                    required_coa(&self.pool, &payload, "salesAccount", "salesAccountId").await?;
                let cogs_account_id =
                    required_coa(&self.pool, &payload, "cogsAccount", "cogsAccountId").await?;
                let return_account_id =
                    required_coa(&self.pool, &payload, "returnAccount", "returnAccountId").await?;

                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_product_account_mapping
                        (product_category_id, inventory_account_id, sales_account_id, cogs_account_id,
                         return_account_id)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id",
                )
                .bind(product_category_id)
                .bind(inventory_account_id)
                .bind(sales_account_id)
                .bind(cogs_account_id)
                .bind(return_account_id)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
            MasterDataEntity::CompanyProfile => {
                let company_name = require_str(&payload, "companyName")?;
                let id: i64 = sqlx::query_scalar(
                    "INSERT INTO masterdata_company_profile
                        (company_name, address, phone, email, npwp, currency_code,
                         default_tax_rate_id, logo_url)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING id",
                )
                .bind(&company_name)
                .bind(as_string(&payload, "address"))
                .bind(as_string(&payload, "phone"))
                .bind(as_string(&payload, "email"))
                .bind(as_string(&payload, "npwp"))
                .bind(
                    as_string(&payload, "currency")
                        .unwrap_or_else(|| "IDR".into())
                        .to_ascii_uppercase(),
                )
                .bind(as_i64(&payload, "defaultTaxRateId"))
                .bind(as_string(&payload, "logoUrl"))
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;
                id
            }
        };

        self.get(entity, id)
            .await?
            .ok_or_else(|| AppError::Database("failed to reload the created record".into()))
    }

    async fn update(
        &self,
        entity: MasterDataEntity,
        id: i64,
        payload: Value,
    ) -> Result<Option<Value>, AppError> {
        let current = self
            .get(entity, id)
            .await?
            .ok_or_else(|| AppError::NotFound(format!("{} not found", entity.display_name())))?;

        match entity {
            MasterDataEntity::Products => {
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;
                let item_type =
                    merged_str(&payload, &current, "itemType").unwrap_or_else(|| "goods".into());
                if !matches!(item_type.as_str(), "goods" | "service") {
                    return Err(AppError::BadRequest(
                        "itemType must be either goods or service".into(),
                    ));
                }
                let base_uom_id =
                    if payload.get("unit").is_some() || payload.get("unitId").is_some() {
                        resolve_uom(
                            &self.pool,
                            as_string(&payload, "unit").as_deref(),
                            as_i64(&payload, "unitId"),
                        )
                        .await?
                    } else {
                        current_i64(&current, "unitId")
                    }
                    .ok_or_else(|| AppError::BadRequest("unit is required".into()))?;
                let category_id =
                    if payload.get("category").is_some() || payload.get("categoryId").is_some() {
                        resolve_category(
                            &self.pool,
                            as_string(&payload, "category").as_deref(),
                            as_i64(&payload, "categoryId"),
                        )
                        .await?
                    } else {
                        current_i64(&current, "categoryId")
                    };
                let secondary_uom_id = if payload.get("secondaryUnit").is_some()
                    || payload.get("secondaryUnitId").is_some()
                {
                    resolve_uom(
                        &self.pool,
                        as_string(&payload, "secondaryUnit").as_deref(),
                        as_i64(&payload, "secondaryUnitId"),
                    )
                    .await?
                } else {
                    current_i64(&current, "secondaryUnitId")
                };
                let product_code =
                    if payload.get("code").is_some() || payload.get("productCode").is_some() {
                        as_string(&payload, "code").or_else(|| as_string(&payload, "productCode"))
                    } else {
                        current_str(&current, "code")
                    }
                    .unwrap_or_else(|| format!("PRD-{id}"));
                let conversion_rate = merged_f64(&payload, &current, "conversionRate")
                    .filter(|value| *value > 0.0)
                    .unwrap_or(1.0);
                let weight_kg = merged_f64(&payload, &current, "weightKg")
                    .unwrap_or(0.0)
                    .max(0.0);
                let barcode = merged_str(&payload, &current, "barcode");
                let selling_price = merged_f64(&payload, &current, "price")
                    .or_else(|| merged_f64(&payload, &current, "sellingPrice"))
                    .unwrap_or(0.0)
                    .max(0.0);
                let cost_price = merged_f64(&payload, &current, "costPrice")
                    .unwrap_or(0.0)
                    .max(0.0);
                let min_stock = merged_f64(&payload, &current, "minStock")
                    .unwrap_or(0.0)
                    .max(0.0);
                let description = merged_str(&payload, &current, "description");
                let status = normalize_status(merged_str(&payload, &current, "status"));

                sqlx::query(
                    "UPDATE masterdata_product
                     SET product_code = $1, name = $2, item_type = $3, category_id = $4,
                         base_uom_id = $5, secondary_uom_id = $6, conversion_rate = $7,
                         weight_kg = $8, barcode = $9, selling_price = $10, cost_price = $11,
                         min_stock = $12, description = $13, status = $14, updated_at = now()
                     WHERE id = $15",
                )
                .bind(&product_code)
                .bind(&name)
                .bind(&item_type)
                .bind(category_id)
                .bind(base_uom_id)
                .bind(secondary_uom_id)
                .bind(conversion_rate)
                .bind(weight_kg)
                .bind(barcode)
                .bind(selling_price)
                .bind(cost_price)
                .bind(min_stock)
                .bind(description)
                .bind(&status)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;

                if item_type == "goods"
                    && let Some(stock) = as_f64(&payload, "stock")
                {
                    self.set_stock(id, stock, cost_price).await?;
                }
            }
            MasterDataEntity::Customers => {
                let company_name = merged_str(&payload, &current, "companyName")
                    .ok_or_else(|| AppError::BadRequest("companyName is required".into()))?;
                let customer_code = if payload.get("customerCode").is_some()
                    || payload.get("code").is_some()
                    || payload.get("nb").is_some()
                {
                    as_string(&payload, "customerCode")
                        .or_else(|| as_string(&payload, "code"))
                        .or_else(|| as_string(&payload, "nb"))
                } else {
                    current_str(&current, "customerCode")
                }
                .unwrap_or_else(|| format!("CUST-{id}"));
                let nb = if payload.get("nb").is_some() {
                    as_string(&payload, "nb")
                } else {
                    current_str(&current, "nb")
                };
                let payment_term_id = if payload.get("paymentTermId").is_some()
                    || payload.get("termOfPayment").is_some()
                {
                    resolve_payment_term(&self.pool, &payload).await?
                } else {
                    current_i64(&current, "paymentTermId")
                };
                let status = normalize_status(merged_str(&payload, &current, "status"));

                sqlx::query(
                    "UPDATE masterdata_customer
                     SET customer_code = $1, company_name = $2, city = $3, contact_person = $4,
                         email = $5, phone = $6, nb = $7, npwp = $8, npwp_address = $9,
                         address = $10, payment_term_id = $11, notes = $12, status = $13,
                         updated_at = now()
                     WHERE id = $14",
                )
                .bind(&customer_code)
                .bind(&company_name)
                .bind(merged_str(&payload, &current, "city"))
                .bind(merged_str(&payload, &current, "contactPerson"))
                .bind(merged_str(&payload, &current, "email"))
                .bind(merged_str(&payload, &current, "phone"))
                .bind(nb)
                .bind(merged_str(&payload, &current, "npwp"))
                .bind(merged_str(&payload, &current, "npwpAddress"))
                .bind(merged_str(&payload, &current, "address"))
                .bind(payment_term_id)
                .bind(merged_str(&payload, &current, "notes"))
                .bind(&status)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::Suppliers => {
                let company_name = merged_str(&payload, &current, "companyName")
                    .ok_or_else(|| AppError::BadRequest("companyName is required".into()))?;
                let supplier_code =
                    if payload.get("supplierCode").is_some() || payload.get("code").is_some() {
                        as_string(&payload, "supplierCode").or_else(|| as_string(&payload, "code"))
                    } else {
                        current_str(&current, "supplierCode")
                    }
                    .unwrap_or_else(|| format!("SUP-{id}"));
                let payment_term_id = if payload.get("paymentTermId").is_some()
                    || payload.get("termOfPayment").is_some()
                {
                    resolve_payment_term(&self.pool, &payload).await?
                } else {
                    current_i64(&current, "paymentTermId")
                };
                let status = normalize_status(merged_str(&payload, &current, "status"));

                sqlx::query(
                    "UPDATE masterdata_supplier
                     SET supplier_code = $1, company_name = $2, contact_person = $3, email = $4,
                         phone = $5, address = $6, city = $7, npwp = $8, payment_term_id = $9,
                         notes = $10, status = $11, updated_at = now()
                     WHERE id = $12",
                )
                .bind(&supplier_code)
                .bind(&company_name)
                .bind(merged_str(&payload, &current, "contactPerson"))
                .bind(merged_str(&payload, &current, "email"))
                .bind(merged_str(&payload, &current, "phone"))
                .bind(merged_str(&payload, &current, "address"))
                .bind(merged_str(&payload, &current, "city"))
                .bind(merged_str(&payload, &current, "npwp"))
                .bind(payment_term_id)
                .bind(merged_str(&payload, &current, "notes"))
                .bind(&status)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::Employees => {
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;
                let position = merged_str(&payload, &current, "position")
                    .ok_or_else(|| AppError::BadRequest("position is required".into()))?;
                let employee_number = if payload.get("employeeNumber").is_some()
                    || payload.get("code").is_some()
                {
                    as_string(&payload, "employeeNumber").or_else(|| as_string(&payload, "code"))
                } else {
                    current_str(&current, "employeeNumber")
                }
                .unwrap_or_else(|| format!("EMP-{id}"));
                let department_id = if payload.get("department").is_some()
                    || payload.get("departmentId").is_some()
                {
                    resolve_department(
                        &self.pool,
                        as_string(&payload, "department").as_deref(),
                        as_i64(&payload, "departmentId"),
                    )
                    .await?
                } else {
                    current_i64(&current, "departmentId")
                };
                let cost_center_id = if payload.get("costCenter").is_some()
                    || payload.get("costCenterId").is_some()
                {
                    resolve_cost_center(
                        &self.pool,
                        as_string(&payload, "costCenter").as_deref(),
                        as_i64(&payload, "costCenterId"),
                    )
                    .await?
                } else {
                    current_i64(&current, "costCenterId")
                };
                let hire_date = if payload.get("hireDate").is_some() {
                    as_string(&payload, "hireDate")
                        .and_then(|value| NaiveDate::parse_from_str(&value, "%Y-%m-%d").ok())
                } else {
                    current_str(&current, "hireDate")
                        .and_then(|value| NaiveDate::parse_from_str(&value, "%Y-%m-%d").ok())
                };
                let status = normalize_employee_status(merged_str(&payload, &current, "status"));

                sqlx::query(
                    "UPDATE masterdata_employee
                     SET employee_number = $1, name = $2, position = $3, department_id = $4,
                         cost_center_id = $5, email = $6, phone = $7, address = $8,
                         hire_date = $9, status = $10, updated_at = now()
                     WHERE id = $11",
                )
                .bind(&employee_number)
                .bind(&name)
                .bind(&position)
                .bind(department_id)
                .bind(cost_center_id)
                .bind(merged_str(&payload, &current, "email"))
                .bind(merged_str(&payload, &current, "phone"))
                .bind(merged_str(&payload, &current, "address"))
                .bind(hire_date)
                .bind(&status)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::Departments => {
                let code = merged_str(&payload, &current, "code")
                    .ok_or_else(|| AppError::BadRequest("code is required".into()))?;
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;
                let manager_employee_id = if payload.get("manager").is_some()
                    || payload.get("managerEmployeeId").is_some()
                {
                    resolve_employee(
                        &self.pool,
                        as_string(&payload, "manager").as_deref(),
                        as_i64(&payload, "managerEmployeeId"),
                    )
                    .await?
                } else {
                    current_i64(&current, "managerEmployeeId")
                };
                let status = normalize_status(merged_str(&payload, &current, "status"));

                sqlx::query(
                    "UPDATE masterdata_department
                     SET code = $1, name = $2, manager_employee_id = $3, status = $4,
                         updated_at = now()
                     WHERE id = $5",
                )
                .bind(&code)
                .bind(&name)
                .bind(manager_employee_id)
                .bind(&status)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;

                if payload.get("costCenter").is_some() {
                    assign_department_cost_center(
                        &self.pool,
                        id,
                        as_string(&payload, "costCenter").as_deref(),
                    )
                    .await?;
                }
            }
            MasterDataEntity::CostCenters => {
                let code = merged_str(&payload, &current, "code")
                    .ok_or_else(|| AppError::BadRequest("code is required".into()))?;
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;
                let department_id = if payload.get("department").is_some()
                    || payload.get("departmentId").is_some()
                {
                    resolve_department(
                        &self.pool,
                        as_string(&payload, "department").as_deref(),
                        as_i64(&payload, "departmentId"),
                    )
                    .await?
                } else {
                    current_i64(&current, "departmentId")
                };
                let status = normalize_status(merged_str(&payload, &current, "status"));

                sqlx::query(
                    "UPDATE masterdata_cost_center
                     SET code = $1, name = $2, department_id = $3, status = $4, updated_at = now()
                     WHERE id = $5",
                )
                .bind(&code)
                .bind(&name)
                .bind(department_id)
                .bind(&status)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::ChartOfAccounts => {
                let code = merged_str(&payload, &current, "code")
                    .ok_or_else(|| AppError::BadRequest("code is required".into()))?;
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;
                let account_type =
                    if payload.get("category").is_some() || payload.get("accountType").is_some() {
                        account_type(&payload)?
                    } else {
                        current_str(&current, "accountType")
                            .unwrap_or_else(|| "asset".into())
                            .to_ascii_lowercase()
                    };
                let normal_balance = if payload.get("normalBalance").is_some() {
                    normal_balance(&payload, &account_type)
                } else {
                    current_str(&current, "normalBalance")
                        .unwrap_or_else(|| normal_balance_for(&account_type).into())
                        .to_ascii_lowercase()
                };
                let opening_balance = merged_f64(&payload, &current, "balance").unwrap_or(0.0);
                let is_header = if payload.get("isHeader").is_some() {
                    as_bool(&payload, "isHeader").unwrap_or(false)
                } else {
                    current_bool(&current, "isHeader").unwrap_or(false)
                };
                let is_active = if payload.get("isActive").is_some() {
                    as_bool(&payload, "isActive").unwrap_or(true)
                } else {
                    current_bool(&current, "isActive").unwrap_or(true)
                };

                sqlx::query(
                    "UPDATE masterdata_coa
                     SET account_code = $1, account_name = $2, account_type = $3,
                         normal_balance = $4, parent_id = $5, is_header = $6, is_active = $7,
                         opening_balance = $8, updated_at = now()
                     WHERE id = $9",
                )
                .bind(&code)
                .bind(&name)
                .bind(&account_type)
                .bind(&normal_balance)
                .bind(merged_i64(&payload, &current, "parentId"))
                .bind(is_header)
                .bind(is_active)
                .bind(opening_balance)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::Warehouses => {
                let code = merged_str(&payload, &current, "code")
                    .ok_or_else(|| AppError::BadRequest("code is required".into()))?;
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;
                let manager_employee_id = if payload.get("manager").is_some()
                    || payload.get("managerEmployeeId").is_some()
                {
                    resolve_employee(
                        &self.pool,
                        as_string(&payload, "manager").as_deref(),
                        as_i64(&payload, "managerEmployeeId"),
                    )
                    .await?
                } else {
                    current_i64(&current, "managerEmployeeId")
                };
                let capacity = merged_f64(&payload, &current, "capacity")
                    .unwrap_or(0.0)
                    .max(0.0);
                let status = normalize_status(merged_str(&payload, &current, "status"));

                sqlx::query(
                    "UPDATE masterdata_warehouse
                     SET code = $1, name = $2, location = $3, manager_employee_id = $4,
                         capacity = $5, status = $6, updated_at = now()
                     WHERE id = $7",
                )
                .bind(&code)
                .bind(&name)
                .bind(merged_str(&payload, &current, "location"))
                .bind(manager_employee_id)
                .bind(capacity)
                .bind(&status)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::TaxRates => {
                let code = merged_str(&payload, &current, "code")
                    .ok_or_else(|| AppError::BadRequest("code is required".into()))?;
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;
                let rate = merged_f64(&payload, &current, "rate")
                    .ok_or_else(|| AppError::BadRequest("rate is required".into()))?;
                if !(0.0..=100.0).contains(&rate) {
                    return Err(AppError::BadRequest(
                        "rate must be between 0 and 100".into(),
                    ));
                }
                let tax_type = if payload.get("type").is_some() || payload.get("taxType").is_some()
                {
                    tax_type(&payload)?
                } else {
                    current_str(&current, "taxType").unwrap_or_else(|| "sales".into())
                };
                let is_active = if payload.get("isActive").is_some() {
                    as_bool(&payload, "isActive").unwrap_or(true)
                } else {
                    current_bool(&current, "isActive").unwrap_or(true)
                };

                sqlx::query(
                    "UPDATE masterdata_tax_rate
                     SET code = $1, name = $2, rate = $3, tax_type = $4, description = $5,
                         is_active = $6, updated_at = now()
                     WHERE id = $7",
                )
                .bind(&code)
                .bind(&name)
                .bind(rate)
                .bind(&tax_type)
                .bind(merged_str(&payload, &current, "description"))
                .bind(is_active)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::PaymentTerms => {
                let code = merged_str(&payload, &current, "code")
                    .ok_or_else(|| AppError::BadRequest("code is required".into()))?;
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;
                let days = merged_i64(&payload, &current, "days").unwrap_or(0).max(0) as i32;
                let is_active = if payload.get("isActive").is_some() {
                    as_bool(&payload, "isActive").unwrap_or(true)
                } else {
                    current_bool(&current, "isActive").unwrap_or(true)
                };

                sqlx::query(
                    "UPDATE masterdata_payment_term
                     SET code = $1, name = $2, days = $3, description = $4, is_active = $5,
                         updated_at = now()
                     WHERE id = $6",
                )
                .bind(&code)
                .bind(&name)
                .bind(days)
                .bind(merged_str(&payload, &current, "description"))
                .bind(is_active)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::BankAccounts => {
                let code = merged_str(&payload, &current, "code")
                    .ok_or_else(|| AppError::BadRequest("code is required".into()))?;
                let bank_name = merged_str(&payload, &current, "bankName")
                    .ok_or_else(|| AppError::BadRequest("bankName is required".into()))?;
                let account_number = merged_str(&payload, &current, "accountNumber")
                    .unwrap_or_else(|| format!("ACC-{}", chrono::Utc::now().timestamp_millis()));
                let account_holder = merged_str(&payload, &current, "accountHolder")
                    .unwrap_or_else(|| "Nama Perusahaan".into());
                let currency = merged_str(&payload, &current, "currency")
                    .unwrap_or_else(|| "IDR".into())
                    .to_ascii_uppercase();
                let coa_id = if payload.get("coaId").is_some() {
                    as_i64(&payload, "coaId")
                        .ok_or_else(|| AppError::BadRequest("coaId is invalid".into()))?
                } else {
                    current_i64(&current, "coaId").unwrap_or(default_bank_coa(&self.pool).await?)
                };
                let opening_balance =
                    merged_f64(&payload, &current, "openingBalance").unwrap_or(0.0);
                let current_balance = if payload.get("balance").is_some() {
                    as_f64(&payload, "balance").unwrap_or(0.0)
                } else {
                    current_f64(&current, "balance").unwrap_or(0.0)
                };
                let status = normalize_status(merged_str(&payload, &current, "status"));

                sqlx::query(
                    "UPDATE masterdata_bank_account
                     SET code = $1, bank_name = $2, account_number = $3, account_holder = $4,
                         currency_code = $5, coa_id = $6, opening_balance = $7,
                         current_balance = $8, status = $9, updated_at = now()
                     WHERE id = $10",
                )
                .bind(&code)
                .bind(&bank_name)
                .bind(&account_number)
                .bind(&account_holder)
                .bind(&currency)
                .bind(coa_id)
                .bind(opening_balance)
                .bind(current_balance)
                .bind(&status)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::Uoms => {
                let code = merged_str(&payload, &current, "code")
                    .ok_or_else(|| AppError::BadRequest("code is required".into()))?;
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;
                let category = if payload.get("category").is_some() {
                    uom_category(&payload)?
                } else {
                    current_str(&current, "category")
                        .unwrap_or_else(|| "count".into())
                        .to_ascii_lowercase()
                };
                let is_active = if payload.get("isActive").is_some() {
                    as_bool(&payload, "isActive").unwrap_or(true)
                } else {
                    current_bool(&current, "isActive").unwrap_or(true)
                };

                sqlx::query(
                    "UPDATE masterdata_uom
                     SET code = $1, name = $2, category = $3, description = $4, is_active = $5,
                         updated_at = now()
                     WHERE id = $6",
                )
                .bind(&code)
                .bind(&name)
                .bind(&category)
                .bind(merged_str(&payload, &current, "description"))
                .bind(is_active)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::ProductCategories => {
                let code = merged_str(&payload, &current, "code")
                    .ok_or_else(|| AppError::BadRequest("code is required".into()))?;
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;

                sqlx::query(
                    "UPDATE masterdata_product_category
                     SET code = $1, name = $2, description = $3, updated_at = now()
                     WHERE id = $4",
                )
                .bind(&code)
                .bind(&name)
                .bind(merged_str(&payload, &current, "description"))
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::PayrollComponents => {
                let code = merged_str(&payload, &current, "code")
                    .ok_or_else(|| AppError::BadRequest("code is required".into()))?;
                let name = merged_str(&payload, &current, "name")
                    .ok_or_else(|| AppError::BadRequest("name is required".into()))?;
                let component_type = if payload.get("componentType").is_some() {
                    component_type(&payload)?
                } else {
                    current_str(&current, "componentType").unwrap_or_else(|| "earning".into())
                };
                let taxable = if payload.get("taxable").is_some() {
                    as_bool(&payload, "taxable").unwrap_or(true)
                } else {
                    current_bool(&current, "taxable").unwrap_or(true)
                };
                let coa_id = if payload.get("coaCode").is_some()
                    || payload.get("coa").is_some()
                    || payload.get("coaId").is_some()
                {
                    resolve_coa(
                        &self.pool,
                        as_string(&payload, "coaCode")
                            .or_else(|| as_string(&payload, "coa"))
                            .as_deref(),
                        as_i64(&payload, "coaId"),
                    )
                    .await?
                    .ok_or_else(|| AppError::BadRequest("COA account is required".into()))?
                } else {
                    current_i64(&current, "coaId")
                        .ok_or_else(|| AppError::BadRequest("COA account is required".into()))?
                };
                let is_active = if payload.get("isActive").is_some() {
                    as_bool(&payload, "isActive").unwrap_or(true)
                } else {
                    current_bool(&current, "isActive").unwrap_or(true)
                };

                sqlx::query(
                    "UPDATE masterdata_payroll_component
                     SET code = $1, name = $2, component_type = $3, taxable = $4, coa_id = $5,
                         is_active = $6, updated_at = now()
                     WHERE id = $7",
                )
                .bind(&code)
                .bind(&name)
                .bind(&component_type)
                .bind(taxable)
                .bind(coa_id)
                .bind(is_active)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::AppConfigs => {
                let key = merged_str(&payload, &current, "key")
                    .ok_or_else(|| AppError::BadRequest("key is required".into()))?;
                let data_type = if payload.get("dataType").is_some() {
                    data_type(&payload)
                } else {
                    current_str(&current, "dataType").unwrap_or_else(|| "string".into())
                };
                let config_value = config_value(&payload, Some(&current), &data_type);
                let is_public = if payload.get("isPublic").is_some() {
                    as_bool(&payload, "isPublic").unwrap_or(false)
                } else {
                    current_bool(&current, "isPublic").unwrap_or(false)
                };
                let is_editable = if payload.get("isEditable").is_some() {
                    as_bool(&payload, "isEditable").unwrap_or(true)
                } else {
                    current_bool(&current, "isEditable").unwrap_or(true)
                };

                sqlx::query(
                    "UPDATE masterdata_config
                     SET config_key = $1, config_value = $2, config_group = $3, data_type = $4,
                         description = $5, is_public = $6, is_editable = $7, updated_at = now()
                     WHERE id = $8",
                )
                .bind(&key)
                .bind(config_value)
                .bind(merged_str(&payload, &current, "group").unwrap_or_else(|| "general".into()))
                .bind(&data_type)
                .bind(merged_str(&payload, &current, "description"))
                .bind(is_public)
                .bind(is_editable)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::ProductAccountMappings => {
                let product_category_id = if payload.get("category").is_some()
                    || payload.get("productCategoryId").is_some()
                {
                    resolve_category(
                        &self.pool,
                        as_string(&payload, "category").as_deref(),
                        as_i64(&payload, "productCategoryId"),
                    )
                    .await?
                    .ok_or_else(|| AppError::BadRequest("category is required".into()))?
                } else {
                    current_i64(&current, "productCategoryId")
                        .ok_or_else(|| AppError::BadRequest("category is required".into()))?
                };
                let inventory_account_id = if payload.get("inventoryAccount").is_some()
                    || payload.get("inventoryAccountId").is_some()
                {
                    required_coa(
                        &self.pool,
                        &payload,
                        "inventoryAccount",
                        "inventoryAccountId",
                    )
                    .await?
                } else {
                    current_i64(&current, "inventoryAccountId").ok_or_else(|| {
                        AppError::BadRequest("inventoryAccount is required".into())
                    })?
                };
                let sales_account_id = if payload.get("salesAccount").is_some()
                    || payload.get("salesAccountId").is_some()
                {
                    required_coa(&self.pool, &payload, "salesAccount", "salesAccountId").await?
                } else {
                    current_i64(&current, "salesAccountId")
                        .ok_or_else(|| AppError::BadRequest("salesAccount is required".into()))?
                };
                let cogs_account_id = if payload.get("cogsAccount").is_some()
                    || payload.get("cogsAccountId").is_some()
                {
                    required_coa(&self.pool, &payload, "cogsAccount", "cogsAccountId").await?
                } else {
                    current_i64(&current, "cogsAccountId")
                        .ok_or_else(|| AppError::BadRequest("cogsAccount is required".into()))?
                };
                let return_account_id = if payload.get("returnAccount").is_some()
                    || payload.get("returnAccountId").is_some()
                {
                    required_coa(&self.pool, &payload, "returnAccount", "returnAccountId").await?
                } else {
                    current_i64(&current, "returnAccountId")
                        .ok_or_else(|| AppError::BadRequest("returnAccount is required".into()))?
                };

                sqlx::query(
                    "UPDATE masterdata_product_account_mapping
                     SET product_category_id = $1, inventory_account_id = $2, sales_account_id = $3,
                         cogs_account_id = $4, return_account_id = $5, updated_at = now()
                     WHERE id = $6",
                )
                .bind(product_category_id)
                .bind(inventory_account_id)
                .bind(sales_account_id)
                .bind(cogs_account_id)
                .bind(return_account_id)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
            MasterDataEntity::CompanyProfile => {
                let company_name = merged_str(&payload, &current, "companyName")
                    .ok_or_else(|| AppError::BadRequest("companyName is required".into()))?;
                let currency = merged_str(&payload, &current, "currency")
                    .unwrap_or_else(|| "IDR".into())
                    .to_ascii_uppercase();
                let default_tax_rate_id = if payload.get("defaultTaxRateId").is_some() {
                    as_i64(&payload, "defaultTaxRateId")
                } else {
                    current_i64(&current, "defaultTaxRateId")
                };

                sqlx::query(
                    "UPDATE masterdata_company_profile
                     SET company_name = $1, address = $2, phone = $3, email = $4, npwp = $5,
                         currency_code = $6, default_tax_rate_id = $7, logo_url = $8,
                         updated_at = now()
                     WHERE id = $9",
                )
                .bind(&company_name)
                .bind(merged_str(&payload, &current, "address"))
                .bind(merged_str(&payload, &current, "phone"))
                .bind(merged_str(&payload, &current, "email"))
                .bind(merged_str(&payload, &current, "npwp"))
                .bind(&currency)
                .bind(default_tax_rate_id)
                .bind(merged_str(&payload, &current, "logoUrl"))
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(db_error)?;
            }
        }

        self.get(entity, id).await
    }

    async fn delete(&self, entity: MasterDataEntity, id: i64) -> Result<bool, AppError> {
        if entity == MasterDataEntity::CompanyProfile {
            return Err(AppError::Forbidden(
                "The company profile cannot be deleted".into(),
            ));
        }

        if entity == MasterDataEntity::Products {
            // Keep the operation atomic: if the product is still referenced by a
            // transaction the stock balance row is rolled back together with it.
            let mut transaction = self.pool.begin().await.map_err(db_error)?;
            sqlx::query("DELETE FROM inventory_stock_balance WHERE product_id = $1")
                .bind(id)
                .execute(&mut *transaction)
                .await
                .map_err(db_error)?;
            let result = sqlx::query("DELETE FROM masterdata_product WHERE id = $1")
                .bind(id)
                .execute(&mut *transaction)
                .await
                .map_err(db_error)?;
            transaction.commit().await.map_err(db_error)?;
            return Ok(result.rows_affected() > 0);
        }

        let sql = format!("DELETE FROM {} WHERE id = $1", table_name(entity));
        let result = sqlx::query(sqlx::AssertSqlSafe(sql))
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(db_error)?;
        Ok(result.rows_affected() > 0)
    }
}

fn list_sql(entity: MasterDataEntity) -> &'static str {
    match entity {
        MasterDataEntity::Products => {
            r#"SELECT p.id,
                      p.product_code AS code,
                      p.name,
                      p.item_type AS "itemType",
                      p.category_id AS "categoryId",
                      c.name AS category,
                      p.base_uom_id AS "unitId",
                      u.code AS unit,
                      p.secondary_uom_id AS "secondaryUnitId",
                      su.code AS "secondaryUnit",
                      p.conversion_rate::float8 AS "conversionRate",
                      p.weight_kg::float8 AS "weightKg",
                      p.barcode,
                      p.selling_price::float8 AS price,
                      p.cost_price::float8 AS "costPrice",
                      COALESCE(sb.quantity_on_hand, 0)::float8 AS stock,
                      p.min_stock::float8 AS "minStock",
                      p.description,
                      p.status
               FROM masterdata_product p
               LEFT JOIN masterdata_product_category c ON c.id = p.category_id
               LEFT JOIN masterdata_uom u ON u.id = p.base_uom_id
               LEFT JOIN masterdata_uom su ON su.id = p.secondary_uom_id
               LEFT JOIN (
                   SELECT product_id, SUM(quantity_on_hand) AS quantity_on_hand
                   FROM inventory_stock_balance
                   GROUP BY product_id
               ) sb ON sb.product_id = p.id
               ORDER BY p.name"#
        }
        MasterDataEntity::Customers => {
            r#"SELECT c.id,
                      c.customer_code AS "customerCode",
                      c.company_name AS "companyName",
                      c.city,
                      c.contact_person AS "contactPerson",
                      c.email,
                      c.phone,
                      c.nb,
                      c.npwp,
                      c.npwp_address AS "npwpAddress",
                      c.address,
                      COALESCE(pt.days, 0) AS "termOfPayment",
                      c.payment_term_id AS "paymentTermId",
                      c.notes,
                      c.status
               FROM masterdata_customer c
               LEFT JOIN masterdata_payment_term pt ON pt.id = c.payment_term_id
               ORDER BY c.company_name"#
        }
        MasterDataEntity::Suppliers => {
            r#"SELECT s.id,
                      s.supplier_code AS "supplierCode",
                      s.company_name AS "companyName",
                      s.contact_person AS "contactPerson",
                      s.email,
                      s.phone,
                      s.address,
                      s.city,
                      s.npwp,
                      s.payment_term_id AS "paymentTermId",
                      COALESCE(pt.days, 0) AS "termOfPayment",
                      s.notes,
                      s.status
               FROM masterdata_supplier s
               LEFT JOIN masterdata_payment_term pt ON pt.id = s.payment_term_id
               ORDER BY s.company_name"#
        }
        MasterDataEntity::Employees => {
            r#"SELECT e.id,
                      e.employee_number AS "employeeNumber",
                      e.name,
                      e.position,
                      e.department_id AS "departmentId",
                      d.name AS department,
                      e.cost_center_id AS "costCenterId",
                      cc.name AS "costCenter",
                      e.email,
                      e.phone,
                      e.address,
                      e.hire_date AS "hireDate",
                      e.status
               FROM masterdata_employee e
               LEFT JOIN masterdata_department d ON d.id = e.department_id
               LEFT JOIN masterdata_cost_center cc ON cc.id = e.cost_center_id
               ORDER BY e.name"#
        }
        MasterDataEntity::Departments => {
            r#"SELECT d.id,
                      d.code,
                      d.name,
                      d.manager_employee_id AS "managerEmployeeId",
                      e.name AS manager,
                      COALESCE((
                          SELECT cc.code
                          FROM masterdata_cost_center cc
                          WHERE cc.department_id = d.id
                          ORDER BY cc.code
                          LIMIT 1
                      ), '') AS "costCenter",
                      d.status
               FROM masterdata_department d
               LEFT JOIN masterdata_employee e ON e.id = d.manager_employee_id
               ORDER BY d.name"#
        }
        MasterDataEntity::CostCenters => {
            r#"SELECT cc.id,
                      cc.code,
                      cc.name,
                      cc.department_id AS "departmentId",
                      d.name AS department,
                      d.code AS "departmentCode",
                      cc.status
               FROM masterdata_cost_center cc
               LEFT JOIN masterdata_department d ON d.id = cc.department_id
               ORDER BY cc.name"#
        }
        MasterDataEntity::ChartOfAccounts => {
            r#"SELECT c.id,
                      c.account_code AS code,
                      c.account_name AS name,
                      c.account_type AS "accountType",
                      initcap(c.account_type) AS category,
                      c.normal_balance AS "normalBalance",
                      c.parent_id AS "parentId",
                      c.is_header AS "isHeader",
                      c.is_active AS "isActive",
                      c.opening_balance::float8 AS balance
               FROM masterdata_coa c
               ORDER BY c.account_code"#
        }
        MasterDataEntity::Warehouses => {
            r#"SELECT w.id,
                      w.code,
                      w.name,
                      w.location,
                      w.manager_employee_id AS "managerEmployeeId",
                      e.name AS manager,
                      w.capacity::text AS capacity,
                      w.status
               FROM masterdata_warehouse w
               LEFT JOIN masterdata_employee e ON e.id = w.manager_employee_id
               ORDER BY w.name"#
        }
        MasterDataEntity::TaxRates => {
            r#"SELECT t.id,
                      t.code,
                      t.name,
                      t.rate::float8 AS rate,
                      t.tax_type AS type,
                      t.tax_type AS "taxType",
                      t.description,
                      t.is_active AS "isActive"
               FROM masterdata_tax_rate t
               ORDER BY t.name"#
        }
        MasterDataEntity::PaymentTerms => {
            r#"SELECT p.id,
                      p.code,
                      p.name,
                      p.days,
                      p.description,
                      p.is_active AS "isActive"
               FROM masterdata_payment_term p
               ORDER BY p.days"#
        }
        MasterDataEntity::BankAccounts => {
            r#"SELECT b.id,
                      b.code,
                      b.bank_name AS "bankName",
                      b.account_number AS "accountNumber",
                      b.account_holder AS "accountHolder",
                      b.currency_code AS currency,
                      b.coa_id AS "coaId",
                      c.account_code AS "coaCode",
                      c.account_name AS "coaName",
                      b.opening_balance::float8 AS "openingBalance",
                      b.current_balance::float8 AS balance,
                      b.status
               FROM masterdata_bank_account b
               LEFT JOIN masterdata_coa c ON c.id = b.coa_id
               ORDER BY b.bank_name"#
        }
        MasterDataEntity::Uoms => {
            r#"SELECT u.id,
                      u.code,
                      u.name,
                      initcap(u.category) AS category,
                      u.description,
                      u.is_active AS "isActive"
               FROM masterdata_uom u
               ORDER BY u.name"#
        }
        MasterDataEntity::ProductCategories => {
            r#"SELECT p.id,
                      p.code,
                      p.name,
                      p.description
               FROM masterdata_product_category p
               ORDER BY p.name"#
        }
        MasterDataEntity::PayrollComponents => {
            r#"SELECT p.id,
                      p.code,
                      p.name,
                      p.component_type AS "componentType",
                      p.taxable,
                      p.coa_id AS "coaId",
                      c.account_code AS "coaCode",
                      c.account_name AS "coaName",
                      p.is_active AS "isActive"
               FROM masterdata_payroll_component p
               LEFT JOIN masterdata_coa c ON c.id = p.coa_id
               ORDER BY p.name"#
        }
        MasterDataEntity::AppConfigs => {
            r#"SELECT c.id,
                      c.config_key AS key,
                      CASE
                          WHEN jsonb_typeof(c.config_value) = 'string'
                              THEN c.config_value #>> '{}'
                          ELSE c.config_value::text
                      END AS value,
                      c.config_group AS "group",
                      c.data_type AS "dataType",
                      c.description,
                      c.is_public AS "isPublic",
                      c.is_editable AS "isEditable"
               FROM masterdata_config c
               ORDER BY c.config_group, c.config_key"#
        }
        MasterDataEntity::ProductAccountMappings => {
            r#"SELECT m.id,
                      m.product_category_id AS "productCategoryId",
                      pc.name AS category,
                      m.inventory_account_id AS "inventoryAccountId",
                      inv.account_code AS "inventoryAccount",
                      m.sales_account_id AS "salesAccountId",
                      sal.account_code AS "salesAccount",
                      m.cogs_account_id AS "cogsAccountId",
                      cogs.account_code AS "cogsAccount",
                      m.return_account_id AS "returnAccountId",
                      ret.account_code AS "returnAccount"
               FROM masterdata_product_account_mapping m
               JOIN masterdata_product_category pc ON pc.id = m.product_category_id
               JOIN masterdata_coa inv ON inv.id = m.inventory_account_id
               JOIN masterdata_coa sal ON sal.id = m.sales_account_id
               JOIN masterdata_coa cogs ON cogs.id = m.cogs_account_id
               JOIN masterdata_coa ret ON ret.id = m.return_account_id
               ORDER BY pc.name"#
        }
        MasterDataEntity::CompanyProfile => {
            r#"SELECT c.id,
                      c.company_name AS "companyName",
                      c.address,
                      c.phone,
                      c.email,
                      c.npwp,
                      c.currency_code AS currency,
                      c.default_tax_rate_id AS "defaultTaxRateId",
                      c.logo_url AS "logoUrl"
               FROM masterdata_company_profile c
               ORDER BY c.id"#
        }
    }
}

fn table_name(entity: MasterDataEntity) -> &'static str {
    match entity {
        MasterDataEntity::Products => "masterdata_product",
        MasterDataEntity::Customers => "masterdata_customer",
        MasterDataEntity::Suppliers => "masterdata_supplier",
        MasterDataEntity::Employees => "masterdata_employee",
        MasterDataEntity::Departments => "masterdata_department",
        MasterDataEntity::CostCenters => "masterdata_cost_center",
        MasterDataEntity::ChartOfAccounts => "masterdata_coa",
        MasterDataEntity::Warehouses => "masterdata_warehouse",
        MasterDataEntity::TaxRates => "masterdata_tax_rate",
        MasterDataEntity::PaymentTerms => "masterdata_payment_term",
        MasterDataEntity::BankAccounts => "masterdata_bank_account",
        MasterDataEntity::Uoms => "masterdata_uom",
        MasterDataEntity::ProductCategories => "masterdata_product_category",
        MasterDataEntity::PayrollComponents => "masterdata_payroll_component",
        MasterDataEntity::AppConfigs => "masterdata_config",
        MasterDataEntity::ProductAccountMappings => "masterdata_product_account_mapping",
        MasterDataEntity::CompanyProfile => "masterdata_company_profile",
    }
}

fn db_error(error: sqlx::Error) -> AppError {
    if let Some(database_error) = error.as_database_error() {
        match database_error.code().as_deref() {
            Some("23505") => {
                return AppError::Conflict(
                    "A record with the same unique code or value already exists".into(),
                );
            }
            Some("23503") => {
                return AppError::Conflict(
                    "This record is still referenced by other data and cannot be deleted".into(),
                );
            }
            Some("23514") => {
                return AppError::BadRequest(
                    "A value does not satisfy the database constraints".into(),
                );
            }
            _ => {}
        }
    }
    AppError::Database(error.to_string())
}

fn as_string(payload: &Value, key: &str) -> Option<String> {
    payload.get(key).and_then(|value| match value {
        Value::String(text) => {
            let trimmed = text.trim();
            if trimmed.is_empty() {
                None
            } else {
                Some(trimmed.to_string())
            }
        }
        Value::Number(number) => Some(number.to_string()),
        Value::Bool(boolean) => Some(boolean.to_string()),
        _ => None,
    })
}

fn as_i64(payload: &Value, key: &str) -> Option<i64> {
    payload.get(key).and_then(|value| match value {
        Value::Number(number) => number
            .as_i64()
            .or_else(|| number.as_f64().map(|number| number as i64)),
        Value::String(text) => text
            .trim()
            .parse::<i64>()
            .ok()
            .or_else(|| text.trim().parse::<f64>().ok().map(|number| number as i64)),
        _ => None,
    })
}

fn as_f64(payload: &Value, key: &str) -> Option<f64> {
    payload.get(key).and_then(|value| match value {
        Value::Number(number) => number.as_f64(),
        Value::String(text) => parse_number(text),
        _ => None,
    })
}

fn as_bool(payload: &Value, key: &str) -> Option<bool> {
    payload.get(key).and_then(|value| match value {
        Value::Bool(boolean) => Some(*boolean),
        Value::Number(number) => number.as_i64().map(|number| number != 0),
        Value::String(text) => match text.trim().to_ascii_lowercase().as_str() {
            "true" | "yes" | "1" | "active" => Some(true),
            "false" | "no" | "0" | "inactive" => Some(false),
            _ => None,
        },
        _ => None,
    })
}

fn current_str(current: &Value, key: &str) -> Option<String> {
    as_string(current, key)
}

fn current_i64(current: &Value, key: &str) -> Option<i64> {
    as_i64(current, key)
}

fn current_f64(current: &Value, key: &str) -> Option<f64> {
    as_f64(current, key)
}

fn current_bool(current: &Value, key: &str) -> Option<bool> {
    as_bool(current, key)
}

fn merged_str(payload: &Value, current: &Value, key: &str) -> Option<String> {
    if payload.get(key).is_some() {
        as_string(payload, key)
    } else {
        current_str(current, key)
    }
}

fn merged_i64(payload: &Value, current: &Value, key: &str) -> Option<i64> {
    if payload.get(key).is_some() {
        as_i64(payload, key)
    } else {
        current_i64(current, key)
    }
}

fn merged_f64(payload: &Value, current: &Value, key: &str) -> Option<f64> {
    if payload.get(key).is_some() {
        as_f64(payload, key)
    } else {
        current_f64(current, key)
    }
}

fn require_str(payload: &Value, key: &str) -> Result<String, AppError> {
    as_string(payload, key).ok_or_else(|| AppError::BadRequest(format!("{key} is required")))
}

fn parse_number(value: &str) -> Option<f64> {
    let cleaned: String = value
        .chars()
        .filter(|character| character.is_ascii_digit() || *character == '.' || *character == '-')
        .collect();
    cleaned.parse::<f64>().ok()
}

fn normalize_status(value: Option<String>) -> String {
    match value
        .unwrap_or_else(|| "active".into())
        .to_ascii_lowercase()
        .as_str()
    {
        "inactive" => "inactive".into(),
        _ => "active".into(),
    }
}

fn normalize_employee_status(value: Option<String>) -> String {
    match value
        .unwrap_or_else(|| "active".into())
        .to_ascii_lowercase()
        .as_str()
    {
        "inactive" => "inactive".into(),
        "resigned" => "resigned".into(),
        _ => "active".into(),
    }
}

fn account_type(payload: &Value) -> Result<String, AppError> {
    let value = as_string(payload, "category")
        .or_else(|| as_string(payload, "accountType"))
        .unwrap_or_else(|| "asset".into())
        .to_ascii_lowercase();
    if matches!(
        value.as_str(),
        "asset" | "liability" | "equity" | "revenue" | "expense"
    ) {
        Ok(value)
    } else {
        Err(AppError::BadRequest(
            "category must be asset, liability, equity, revenue or expense".into(),
        ))
    }
}

fn normal_balance_for(account_type: &str) -> &'static str {
    match account_type {
        "asset" | "expense" => "debit",
        _ => "credit",
    }
}

fn normal_balance(payload: &Value, account_type: &str) -> String {
    as_string(payload, "normalBalance")
        .map(|value| value.to_ascii_lowercase())
        .filter(|value| value == "debit" || value == "credit")
        .unwrap_or_else(|| normal_balance_for(account_type).into())
}

fn tax_type(payload: &Value) -> Result<String, AppError> {
    let value = as_string(payload, "type")
        .or_else(|| as_string(payload, "taxType"))
        .unwrap_or_else(|| "sales".into())
        .to_ascii_lowercase();
    if matches!(value.as_str(), "sales" | "purchase" | "withholding") {
        Ok(value)
    } else {
        Err(AppError::BadRequest(
            "type must be sales, purchase or withholding".into(),
        ))
    }
}

fn uom_category(payload: &Value) -> Result<String, AppError> {
    let value = as_string(payload, "category")
        .unwrap_or_else(|| "count".into())
        .to_ascii_lowercase();
    if matches!(
        value.as_str(),
        "count" | "weight" | "volume" | "length" | "time" | "service"
    ) {
        Ok(value)
    } else {
        Err(AppError::BadRequest(
            "category must be count, weight, volume, length, time or service".into(),
        ))
    }
}

fn component_type(payload: &Value) -> Result<String, AppError> {
    let value = as_string(payload, "componentType")
        .unwrap_or_else(|| "earning".into())
        .to_ascii_lowercase();
    if matches!(
        value.as_str(),
        "earning" | "deduction" | "employer_contribution"
    ) {
        Ok(value)
    } else {
        Err(AppError::BadRequest(
            "componentType must be earning, deduction or employer_contribution".into(),
        ))
    }
}

fn data_type(payload: &Value) -> String {
    let value = as_string(payload, "dataType")
        .unwrap_or_else(|| "string".into())
        .to_ascii_lowercase();
    if matches!(
        value.as_str(),
        "string" | "number" | "boolean" | "json" | "date"
    ) {
        value
    } else {
        "string".into()
    }
}

fn config_value(payload: &Value, current: Option<&Value>, data_type: &str) -> Value {
    let raw = if payload.get("value").is_some() {
        as_string(payload, "value")
    } else {
        current.and_then(|current| current_str(current, "value"))
    };

    match data_type {
        "boolean" => {
            let value = as_bool(payload, "value")
                .or_else(|| current.and_then(|current| current_bool(current, "value")))
                .unwrap_or(false);
            Value::Bool(value)
        }
        "number" => {
            let value = as_f64(payload, "value")
                .or_else(|| current.and_then(|current| current_f64(current, "value")))
                .unwrap_or(0.0);
            Number::from_f64(value)
                .map(Value::Number)
                .unwrap_or(Value::Null)
        }
        "json" => raw
            .and_then(|value| serde_json::from_str(&value).ok())
            .unwrap_or(Value::Null),
        _ => raw.map(Value::String).unwrap_or(Value::Null),
    }
}

async fn lookup_id(pool: &PgPool, sql: &str, value: &str) -> Result<Option<i64>, AppError> {
    sqlx::query_scalar::<_, i64>(sqlx::AssertSqlSafe(sql))
        .bind(value)
        .fetch_optional(pool)
        .await
        .map_err(db_error)
}

async fn resolve_uom(
    pool: &PgPool,
    value: Option<&str>,
    id: Option<i64>,
) -> Result<Option<i64>, AppError> {
    if let Some(id) = id {
        return Ok(Some(id));
    }
    if let Some(value) = value {
        return lookup_id(
            pool,
            "SELECT id FROM masterdata_uom
             WHERE lower(code) = lower($1) OR lower(name) = lower($1)
             ORDER BY id LIMIT 1",
            value,
        )
        .await;
    }
    Ok(None)
}

async fn resolve_category(
    pool: &PgPool,
    value: Option<&str>,
    id: Option<i64>,
) -> Result<Option<i64>, AppError> {
    if let Some(id) = id {
        return Ok(Some(id));
    }
    if let Some(value) = value {
        return lookup_id(
            pool,
            "SELECT id FROM masterdata_product_category
             WHERE lower(code) = lower($1) OR lower(name) = lower($1)
             ORDER BY id LIMIT 1",
            value,
        )
        .await;
    }
    Ok(None)
}

async fn resolve_employee(
    pool: &PgPool,
    value: Option<&str>,
    id: Option<i64>,
) -> Result<Option<i64>, AppError> {
    if let Some(id) = id {
        return Ok(Some(id));
    }
    if let Some(value) = value {
        return lookup_id(
            pool,
            "SELECT id FROM masterdata_employee
             WHERE lower(employee_number) = lower($1) OR lower(name) = lower($1)
             ORDER BY id LIMIT 1",
            value,
        )
        .await;
    }
    Ok(None)
}

async fn resolve_department(
    pool: &PgPool,
    value: Option<&str>,
    id: Option<i64>,
) -> Result<Option<i64>, AppError> {
    if let Some(id) = id {
        return Ok(Some(id));
    }
    if let Some(value) = value {
        return lookup_id(
            pool,
            "SELECT id FROM masterdata_department
             WHERE lower(code) = lower($1) OR lower(name) = lower($1)
             ORDER BY id LIMIT 1",
            value,
        )
        .await;
    }
    Ok(None)
}

async fn resolve_cost_center(
    pool: &PgPool,
    value: Option<&str>,
    id: Option<i64>,
) -> Result<Option<i64>, AppError> {
    if let Some(id) = id {
        return Ok(Some(id));
    }
    if let Some(value) = value {
        return lookup_id(
            pool,
            "SELECT id FROM masterdata_cost_center
             WHERE lower(code) = lower($1) OR lower(name) = lower($1)
             ORDER BY id LIMIT 1",
            value,
        )
        .await;
    }
    Ok(None)
}

async fn resolve_coa(
    pool: &PgPool,
    value: Option<&str>,
    id: Option<i64>,
) -> Result<Option<i64>, AppError> {
    if let Some(id) = id {
        return Ok(Some(id));
    }
    if let Some(value) = value {
        let candidate = value.split(" - ").next().unwrap_or(value).trim();
        if !candidate.is_empty() {
            return lookup_id(
                pool,
                "SELECT id FROM masterdata_coa
                 WHERE lower(account_code) = lower($1) OR lower(account_name) = lower($1)
                 ORDER BY id LIMIT 1",
                candidate,
            )
            .await;
        }
    }
    Ok(None)
}

async fn required_coa(
    pool: &PgPool,
    payload: &Value,
    text_key: &str,
    id_key: &str,
) -> Result<i64, AppError> {
    resolve_coa(
        pool,
        as_string(payload, text_key).as_deref(),
        as_i64(payload, id_key),
    )
    .await?
    .ok_or_else(|| AppError::BadRequest(format!("{text_key} is required")))
}

async fn resolve_payment_term(pool: &PgPool, payload: &Value) -> Result<Option<i64>, AppError> {
    if let Some(id) = as_i64(payload, "paymentTermId") {
        return Ok(Some(id));
    }
    if let Some(days) = as_i64(payload, "termOfPayment") {
        return sqlx::query_scalar::<_, i64>(
            "SELECT id FROM masterdata_payment_term WHERE days = $1 ORDER BY id LIMIT 1",
        )
        .bind(days as i32)
        .fetch_optional(pool)
        .await
        .map_err(db_error);
    }
    Ok(None)
}

async fn default_bank_coa(pool: &PgPool) -> Result<i64, AppError> {
    sqlx::query_scalar::<_, i64>(
        "SELECT id FROM masterdata_coa
         WHERE is_active = TRUE AND is_header = FALSE AND account_type = 'asset'
         ORDER BY
             CASE
                 WHEN account_name ILIKE '%bank%' THEN 0
                 WHEN account_name ILIKE '%cash%' THEN 1
                 ELSE 2
             END,
             account_code
         LIMIT 1",
    )
    .fetch_optional(pool)
    .await
    .map_err(db_error)?
    .ok_or_else(|| {
        AppError::BadRequest(
            "No asset COA account is available for the bank account. Create a COA first.".into(),
        )
    })
}

async fn assign_department_cost_center(
    pool: &PgPool,
    department_id: i64,
    value: Option<&str>,
) -> Result<(), AppError> {
    let Some(raw) = value else {
        return Ok(());
    };
    let candidate = raw.split(" - ").next().unwrap_or(raw).trim();
    if candidate.is_empty() {
        sqlx::query(
            "UPDATE masterdata_cost_center
             SET department_id = NULL, updated_at = now()
             WHERE department_id = $1",
        )
        .bind(department_id)
        .execute(pool)
        .await
        .map_err(db_error)?;
        return Ok(());
    }

    if let Some(cost_center_id) = lookup_id(
        pool,
        "SELECT id FROM masterdata_cost_center
         WHERE lower(code) = lower($1) OR lower(name) = lower($1)
         ORDER BY id LIMIT 1",
        candidate,
    )
    .await?
    {
        sqlx::query(
            "UPDATE masterdata_cost_center
             SET department_id = NULL, updated_at = now()
             WHERE department_id = $1 AND id <> $2",
        )
        .bind(department_id)
        .bind(cost_center_id)
        .execute(pool)
        .await
        .map_err(db_error)?;

        sqlx::query(
            "UPDATE masterdata_cost_center
             SET department_id = $1, updated_at = now()
             WHERE id = $2",
        )
        .bind(department_id)
        .bind(cost_center_id)
        .execute(pool)
        .await
        .map_err(db_error)?;
    }
    Ok(())
}
