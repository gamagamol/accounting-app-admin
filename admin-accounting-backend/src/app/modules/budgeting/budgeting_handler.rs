use std::sync::Arc;

use axum::Json;
use axum::extract::{Extension, Path, Query};
use axum::http::StatusCode;

use super::budgeting_dto::{
    ApproveBudgetDto, BudgetDocumentResponse, BudgetListQuery, CreateAllocationDto,
    CreateBudgetPlanDto, CreateExpenseDto,
};
use super::budgeting_interfaces::IBudgetingUsecase;
use crate::pkg::response::response_error::AppResult;
use crate::pkg::response::response_success::ApiResponse;

pub struct BudgetingHandler;

impl BudgetingHandler {
    pub async fn list_budgets(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Query(query): Query<BudgetListQuery>,
    ) -> AppResult<Json<ApiResponse<Vec<serde_json::Value>>>> {
        let (items, meta) = usecase.list_budgets(query).await?;
        Ok(Json(ApiResponse::paginated(
            "Budget plans retrieved successfully",
            items,
            meta,
        )))
    }

    pub async fn get_budget(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Path(id): Path<i64>,
    ) -> AppResult<Json<ApiResponse<BudgetDocumentResponse>>> {
        let item = usecase.get_budget(id).await?;
        Ok(Json(ApiResponse::success(
            "Budget plan retrieved successfully",
            item,
        )))
    }

    pub async fn create_budget(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Json(dto): Json<CreateBudgetPlanDto>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<BudgetDocumentResponse>>)> {
        let created = usecase.create_budget(dto).await?;
        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success(
                "Budget plan created successfully",
                created,
            )),
        ))
    }

    pub async fn approve_budget(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<ApproveBudgetDto>,
    ) -> AppResult<Json<ApiResponse<BudgetDocumentResponse>>> {
        let item = usecase.approve_budget(id, dto).await?;
        Ok(Json(ApiResponse::success(
            "Budget plan approved successfully",
            item,
        )))
    }

    pub async fn list_allocations(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Query(query): Query<BudgetListQuery>,
    ) -> AppResult<Json<ApiResponse<Vec<serde_json::Value>>>> {
        let (items, meta) = usecase.list_allocations(query).await?;
        Ok(Json(ApiResponse::paginated(
            "Budget allocations retrieved successfully",
            items,
            meta,
        )))
    }

    pub async fn get_allocation(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Path(id): Path<i64>,
    ) -> AppResult<Json<ApiResponse<BudgetDocumentResponse>>> {
        let item = usecase.get_allocation(id).await?;
        Ok(Json(ApiResponse::success(
            "Budget allocation retrieved successfully",
            item,
        )))
    }

    pub async fn create_allocation(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Json(dto): Json<CreateAllocationDto>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<BudgetDocumentResponse>>)> {
        let created = usecase.create_allocation(dto).await?;
        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success(
                "Budget allocation created successfully",
                created,
            )),
        ))
    }

    pub async fn approve_allocation(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<ApproveBudgetDto>,
    ) -> AppResult<Json<ApiResponse<BudgetDocumentResponse>>> {
        let item = usecase.approve_allocation(id, dto).await?;
        Ok(Json(ApiResponse::success(
            "Budget allocation approved successfully",
            item,
        )))
    }

    pub async fn list_expenses(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Query(query): Query<BudgetListQuery>,
    ) -> AppResult<Json<ApiResponse<Vec<serde_json::Value>>>> {
        let (items, meta) = usecase.list_expenses(query).await?;
        Ok(Json(ApiResponse::paginated(
            "Expenses retrieved successfully",
            items,
            meta,
        )))
    }

    pub async fn get_expense(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Path(id): Path<i64>,
    ) -> AppResult<Json<ApiResponse<BudgetDocumentResponse>>> {
        let item = usecase.get_expense(id).await?;
        Ok(Json(ApiResponse::success(
            "Expense retrieved successfully",
            item,
        )))
    }

    pub async fn create_expense(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Json(dto): Json<CreateExpenseDto>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<BudgetDocumentResponse>>)> {
        let created = usecase.create_expense(dto).await?;
        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success(
                "Expense created successfully",
                created,
            )),
        ))
    }

    pub async fn approve_expense(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<ApproveBudgetDto>,
    ) -> AppResult<Json<ApiResponse<BudgetDocumentResponse>>> {
        let item = usecase.approve_expense(id, dto).await?;
        Ok(Json(ApiResponse::success(
            "Expense approved successfully",
            item,
        )))
    }

    pub async fn post_expense(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<ApproveBudgetDto>,
    ) -> AppResult<Json<ApiResponse<BudgetDocumentResponse>>> {
        let item = usecase.post_expense(id, dto).await?;
        Ok(Json(ApiResponse::success(
            "Expense posted successfully",
            item,
        )))
    }

    pub async fn budget_vs_actual(
        Extension(usecase): Extension<Arc<dyn IBudgetingUsecase>>,
    ) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
        let item = usecase.budget_vs_actual().await?;
        Ok(Json(ApiResponse::success(
            "Budget vs actual retrieved successfully",
            item,
        )))
    }
}
