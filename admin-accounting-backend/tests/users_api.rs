use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use admin_accounting_backend::app::build_routes;
use admin_accounting_backend::app::modules::audit_log::{
    AuditFilter, AuditLogEntry, AuditLogUsecase, IAuditLogRepo, IAuditLogUsecase,
};
use admin_accounting_backend::app::modules::budgeting::{
    ApproveBudgetDto, BudgetDocumentResponse, BudgetListQuery, CreateAllocationDto,
    CreateBudgetPlanDto, CreateExpenseDto, IBudgetingUsecase,
};
use admin_accounting_backend::app::modules::journal::{
    CreateJournalDto, IJournalUsecase, JournalActionDto, JournalListQuery,
};
use admin_accounting_backend::app::modules::master_data::{
    IMasterDataCrudUsecase, IMasterDataUsecase, MasterDataEntity, MasterDataOptions,
};
use admin_accounting_backend::app::modules::period::{
    CreatePeriodDto, IPeriodUsecase, ListPeriodsQuery, PeriodActionDto, UpdatePeriodDto,
};
use admin_accounting_backend::app::modules::product_category::{
    IProductCategoryUsecase, ListProductCategoriesQuery, ProductCategoryData,
    ProductCategoryResponse,
};
use admin_accounting_backend::app::modules::reports::{CreateReportLockDto, IReportUsecase};
use admin_accounting_backend::app::modules::transactions::{
    ApproveTransactionDto, CreateTransactionDto, DocumentType, ITransactionUsecase,
    ListTransactionsQuery, TransactionResponse,
};
use admin_accounting_backend::app::modules::users::{
    IUserRepo, IUserUsecase, User, UserFilter, UserUsecase,
};
use admin_accounting_backend::app::routers::routes::RouteDeps;
use admin_accounting_backend::infra::Config;
use admin_accounting_backend::pkg::response::response_error::AppError;
use admin_accounting_backend::pkg::response::response_success::PaginationMeta;
use admin_accounting_backend::pkg::types::Id;
use async_trait::async_trait;
use axum::Router;
use axum::body::{Body, to_bytes};
use axum::http::{Method, Request, StatusCode, header};
use serde_json::{Value, json};
use tower::ServiceExt;

/// Test double untuk `IUserRepo`.
/// Production repo wajib PostgreSQL + Redis, jadi test memakai implementasi
/// in-memory ini supaya tidak butuh server database.
#[derive(Default)]
struct InMemoryUsersRepo {
    users: RwLock<HashMap<String, User>>,
}

#[async_trait]
impl IUserRepo for InMemoryUsersRepo {
    async fn find_all(&self, filter: UserFilter) -> Result<(Vec<User>, u64), String> {
        let store = self.users.read().unwrap();
        let mut users: Vec<User> = store.values().cloned().collect();

        users.retain(|user| {
            let role_ok = filter.role.as_ref().is_none_or(|role| &user.role == role);
            let search_ok = filter.search.as_ref().is_none_or(|search| {
                let search = search.to_lowercase();
                user.name.to_lowercase().contains(&search)
                    || user.email.to_lowercase().contains(&search)
            });
            role_ok && search_ok
        });

        users.sort_by_key(|user| std::cmp::Reverse(user.created_at));

        let total = users.len() as u64;
        let start = ((filter.page.saturating_sub(1)) * filter.limit) as usize;
        let paged = users
            .into_iter()
            .skip(start)
            .take(filter.limit as usize)
            .collect();

        Ok((paged, total))
    }

    async fn find_by_id(&self, id: &Id) -> Result<Option<User>, String> {
        Ok(self.users.read().unwrap().get(id.as_str()).cloned())
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, String> {
        Ok(self
            .users
            .read()
            .unwrap()
            .values()
            .find(|user| user.email == email)
            .cloned())
    }

    async fn create(&self, user: &User) -> Result<User, String> {
        self.users
            .write()
            .unwrap()
            .insert(user.id.clone(), user.clone());
        Ok(user.clone())
    }

    async fn update(&self, user: &User) -> Result<User, String> {
        self.users
            .write()
            .unwrap()
            .insert(user.id.clone(), user.clone());
        Ok(user.clone())
    }

    async fn delete(&self, id: &Id) -> Result<bool, String> {
        Ok(self.users.write().unwrap().remove(id.as_str()).is_some())
    }
}

/// Test double minimal untuk `IAuditLogRepo`.
/// Audit log tidak diuji di sini, jadi cukup mengembalikan data kosong.
struct InMemoryAuditLogRepo;

#[async_trait]
impl IAuditLogRepo for InMemoryAuditLogRepo {
    async fn list(&self, _filter: AuditFilter) -> Result<(Vec<AuditLogEntry>, i64), String> {
        Ok((Vec::new(), 0))
    }

    async fn get_by_id(&self, _id: &str) -> Result<Option<AuditLogEntry>, String> {
        Ok(None)
    }

    async fn create(&self, _entry: &AuditLogEntry) -> Result<(), String> {
        Ok(())
    }

    async fn delete(&self, _id: &str) -> Result<bool, String> {
        Ok(false)
    }

    async fn delete_for_entity(&self, _entity_type: &str, _entity_id: &str) -> Result<u64, String> {
        Ok(0)
    }
}

struct UnimplementedProductCategory;

#[async_trait]
impl IProductCategoryUsecase for UnimplementedProductCategory {
    async fn list(
        &self,
        _query: ListProductCategoriesQuery,
    ) -> Result<(Vec<ProductCategoryResponse>, PaginationMeta), AppError> {
        unimplemented!()
    }
    async fn get_by_id(&self, _id: i64) -> Result<ProductCategoryResponse, AppError> {
        unimplemented!()
    }
    async fn create(
        &self,
        _data: ProductCategoryData,
    ) -> Result<ProductCategoryResponse, AppError> {
        unimplemented!()
    }
    async fn update(
        &self,
        _id: i64,
        _data: ProductCategoryData,
    ) -> Result<ProductCategoryResponse, AppError> {
        unimplemented!()
    }
    async fn delete(&self, _id: i64) -> Result<(), AppError> {
        unimplemented!()
    }
}

struct UnimplementedMasterData;

#[async_trait]
impl IMasterDataUsecase for UnimplementedMasterData {
    async fn options(&self) -> Result<MasterDataOptions, AppError> {
        unimplemented!()
    }
}

struct UnimplementedMasterDataCrud;

#[async_trait]
impl IMasterDataCrudUsecase for UnimplementedMasterDataCrud {
    async fn list(&self, _entity: MasterDataEntity) -> Result<Vec<Value>, AppError> {
        unimplemented!()
    }
    async fn get(&self, _entity: MasterDataEntity, _id: i64) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn create(&self, _entity: MasterDataEntity, _payload: Value) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn update(
        &self,
        _entity: MasterDataEntity,
        _id: i64,
        _payload: Value,
    ) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn delete(&self, _entity: MasterDataEntity, _id: i64) -> Result<(), AppError> {
        unimplemented!()
    }
}

struct UnimplementedPeriods;

#[async_trait]
impl IPeriodUsecase for UnimplementedPeriods {
    async fn list(&self, _query: ListPeriodsQuery) -> Result<Vec<Value>, AppError> {
        unimplemented!()
    }
    async fn get(&self, _id: i64) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn create(&self, _dto: CreatePeriodDto) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn update(&self, _id: i64, _dto: UpdatePeriodDto) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn delete(&self, _id: i64) -> Result<(), AppError> {
        unimplemented!()
    }
    async fn close(&self, _id: i64, _dto: PeriodActionDto) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn reopen(&self, _id: i64, _dto: PeriodActionDto) -> Result<Value, AppError> {
        unimplemented!()
    }
}

struct UnimplementedTransactions;

#[async_trait]
impl ITransactionUsecase for UnimplementedTransactions {
    async fn list(
        &self,
        _doc_type: DocumentType,
        _query: ListTransactionsQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        unimplemented!()
    }
    async fn get(
        &self,
        _doc_type: DocumentType,
        _id: i64,
    ) -> Result<TransactionResponse, AppError> {
        unimplemented!()
    }
    async fn create(
        &self,
        _doc_type: DocumentType,
        _dto: CreateTransactionDto,
    ) -> Result<TransactionResponse, AppError> {
        unimplemented!()
    }
    async fn approve(
        &self,
        _doc_type: DocumentType,
        _id: i64,
        _dto: ApproveTransactionDto,
    ) -> Result<TransactionResponse, AppError> {
        unimplemented!()
    }
}

struct UnimplementedBudgeting;

#[async_trait]
impl IBudgetingUsecase for UnimplementedBudgeting {
    async fn list_budgets(
        &self,
        _query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        unimplemented!()
    }
    async fn get_budget(&self, _id: i64) -> Result<BudgetDocumentResponse, AppError> {
        unimplemented!()
    }
    async fn create_budget(
        &self,
        _dto: CreateBudgetPlanDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        unimplemented!()
    }
    async fn approve_budget(
        &self,
        _id: i64,
        _dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        unimplemented!()
    }
    async fn list_allocations(
        &self,
        _query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        unimplemented!()
    }
    async fn get_allocation(&self, _id: i64) -> Result<BudgetDocumentResponse, AppError> {
        unimplemented!()
    }
    async fn create_allocation(
        &self,
        _dto: CreateAllocationDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        unimplemented!()
    }
    async fn approve_allocation(
        &self,
        _id: i64,
        _dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        unimplemented!()
    }
    async fn list_expenses(
        &self,
        _query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        unimplemented!()
    }
    async fn get_expense(&self, _id: i64) -> Result<BudgetDocumentResponse, AppError> {
        unimplemented!()
    }
    async fn create_expense(
        &self,
        _dto: CreateExpenseDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        unimplemented!()
    }
    async fn approve_expense(
        &self,
        _id: i64,
        _dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        unimplemented!()
    }
    async fn post_expense(
        &self,
        _id: i64,
        _dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        unimplemented!()
    }
    async fn budget_vs_actual(&self) -> Result<Value, AppError> {
        unimplemented!()
    }
}

struct UnimplementedReports;

#[async_trait]
impl IReportUsecase for UnimplementedReports {
    async fn get(&self, _slug: &str, _period: Option<&str>) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn get_lock(&self, _slug: &str, _period: &str) -> Result<Option<Value>, AppError> {
        unimplemented!()
    }
    async fn lock(&self, _slug: &str, _dto: CreateReportLockDto) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn unlock(&self, _slug: &str, _period: &str) -> Result<(), AppError> {
        unimplemented!()
    }
    fn available(&self) -> &'static [&'static str] {
        &[]
    }
}

struct UnimplementedJournals;

#[async_trait]
impl IJournalUsecase for UnimplementedJournals {
    async fn list(
        &self,
        _query: JournalListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        unimplemented!()
    }
    async fn get(&self, _id: i64) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn create(&self, _dto: CreateJournalDto) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn update(&self, _id: i64, _dto: CreateJournalDto) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn delete(&self, _id: i64, _actor: Option<String>) -> Result<(), AppError> {
        unimplemented!()
    }
    async fn post(&self, _id: i64, _dto: JournalActionDto) -> Result<Value, AppError> {
        unimplemented!()
    }
    async fn unpost(&self, _id: i64, _dto: JournalActionDto) -> Result<Value, AppError> {
        unimplemented!()
    }
}

fn test_app() -> Router {
    let config = Arc::new(Config::default());
    let user_repo = Arc::new(InMemoryUsersRepo::default());
    let audit_repo = Arc::new(InMemoryAuditLogRepo);

    let user_usecase: Arc<dyn IUserUsecase> = Arc::new(UserUsecase::new(user_repo));
    let audit_log_usecase: Arc<dyn IAuditLogUsecase> = Arc::new(AuditLogUsecase::new(audit_repo));

    build_routes(RouteDeps {
        config,
        user_usecase,
        audit_log_usecase,
        product_category_usecase: Arc::new(UnimplementedProductCategory),
        master_data_usecase: Arc::new(UnimplementedMasterData),
        master_data_crud_usecase: Arc::new(UnimplementedMasterDataCrud),
        transaction_usecase: Arc::new(UnimplementedTransactions),
        budgeting_usecase: Arc::new(UnimplementedBudgeting),
        report_usecase: Arc::new(UnimplementedReports),
        journal_usecase: Arc::new(UnimplementedJournals),
        period_usecase: Arc::new(UnimplementedPeriods),
    })
}

async fn send(
    app: Router,
    method: Method,
    uri: &str,
    payload: Option<Value>,
) -> (StatusCode, Value) {
    let mut builder = Request::builder().method(method).uri(uri);

    let body = match payload {
        Some(payload) => {
            builder = builder.header(header::CONTENT_TYPE, "application/json");
            Body::from(payload.to_string())
        }
        None => Body::empty(),
    };

    let response = app
        .oneshot(builder.body(body).expect("valid request"))
        .await
        .expect("request should succeed");

    let status = response.status();
    let bytes = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("response body should be readable");

    let payload = if bytes.is_empty() {
        Value::Null
    } else {
        serde_json::from_slice(&bytes).expect("response should be JSON")
    };

    (status, payload)
}

#[tokio::test]
async fn health_endpoint_returns_ok() {
    let (status, payload) = send(test_app(), Method::GET, "/health", None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["success"], true);
    assert_eq!(payload["data"]["database"], "postgres");
}

#[tokio::test]
async fn users_api_full_crud_flow() {
    let app = test_app();

    // 1. Initial list should be empty
    let (status, payload) = send(
        app.clone(),
        Method::GET,
        "/api/v1/users?page=1&limit=10",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["meta"]["total"], 0);

    // 2. Create User
    let (status, created) = send(
        app.clone(),
        Method::POST,
        "/api/v1/users",
        Some(json!({
            "name": "Budi Pratama",
            "email": "budi.pratama@byond.co.id",
            "role": "SALES_ADMIN",
            "avatar": ""
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(created["data"]["email"], "budi.pratama@byond.co.id");

    let user_id = created["data"]["id"]
        .as_str()
        .expect("valid user id string")
        .to_string();

    // 3. Duplicate Email conflict check
    let (status, payload) = send(
        app.clone(),
        Method::POST,
        "/api/v1/users",
        Some(json!({
            "name": "Duplicate Budi",
            "email": "budi.pratama@byond.co.id",
            "role": "OWNER",
            "avatar": ""
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(payload["message"], "Email is already registered");

    // 4. Get by ID
    let (status, payload) = send(
        app.clone(),
        Method::GET,
        &format!("/api/v1/users/{user_id}"),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["data"]["name"], "Budi Pratama");

    // 5. Update User
    let (status, updated) = send(
        app.clone(),
        Method::PUT,
        &format!("/api/v1/users/{user_id}"),
        Some(json!({
            "name": "Budi Pratama Updated",
            "role": "ACCOUNTING_ADMIN"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(updated["data"]["name"], "Budi Pratama Updated");
    assert_eq!(updated["data"]["role"], "ACCOUNTING_ADMIN");

    // 6. List with filter
    let (status, payload) = send(
        app.clone(),
        Method::GET,
        "/api/v1/users?search=Budi&role=ACCOUNTING_ADMIN&page=1&limit=5",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["meta"]["total"], 1);

    // 7. Validation error check
    let (status, payload) = send(
        app.clone(),
        Method::POST,
        "/api/v1/users",
        Some(json!({
            "name": "",
            "email": "invalid-email",
            "role": "INVALID_ROLE"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert!(payload["message"].is_string());

    // 8. Delete User
    let (status, _) = send(
        app.clone(),
        Method::DELETE,
        &format!("/api/v1/users/{user_id}"),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    // 9. Verify User is Gone
    let (status, payload) = send(app, Method::GET, &format!("/api/v1/users/{user_id}"), None).await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    assert_eq!(payload["message"], "User not found");
}
