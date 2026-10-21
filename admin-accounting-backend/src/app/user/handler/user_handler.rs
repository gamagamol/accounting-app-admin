use std::sync::Arc;

use axum::Json;
use axum::extract::rejection::{JsonRejection, QueryRejection};
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;

use crate::app::error::{AppError, AppResult};
use crate::core::user::entities::UserError;
use crate::core::user::interfaces::UserUsecase;
use crate::core::user::usecases::dto::{
    CreateUserRequest, ListUsersRequest, PageMeta, UpdateUserRequest, UserResponse,
};
use crate::pkg::response::ApiResponse;

use super::ListUsersQuery;

pub struct UserHandler {
    usecase: Arc<dyn UserUsecase>,
}

impl UserHandler {
    pub fn new(usecase: Arc<dyn UserUsecase>) -> Self {
        Self { usecase }
    }

    /// GET /api/users
    pub async fn list(
        State(handler): State<Arc<UserHandler>>,
        query: Result<Query<ListUsersQuery>, QueryRejection>,
    ) -> AppResult<Json<ApiResponse<Vec<UserResponse>>>> {
        let Query(query) = query
            .map_err(|rejection| AppError::from(UserError::BadRequest(rejection.to_string())))?;

        let result = handler
            .usecase
            .list(ListUsersRequest {
                search: query.search,
                role: query.role,
                page: query.page.unwrap_or(1),
                limit: query.limit.unwrap_or(10),
            })
            .await?;

        let meta = PageMeta {
            page: result.page,
            limit: result.limit,
            total: result.total,
        };

        Ok(Json(ApiResponse::success_with_meta(
            "Users retrieved successfully",
            result.items,
            serde_json::to_value(meta).unwrap_or(serde_json::Value::Null),
        )))
    }

    /// GET /api/users/:id
    pub async fn get(
        State(handler): State<Arc<UserHandler>>,
        Path(id): Path<String>,
    ) -> AppResult<Json<ApiResponse<UserResponse>>> {
        let user = handler.usecase.get(id).await?;
        Ok(Json(ApiResponse::success(
            "User retrieved successfully",
            user,
        )))
    }

    /// POST /api/users
    pub async fn create(
        State(handler): State<Arc<UserHandler>>,
        payload: Result<Json<CreateUserRequest>, JsonRejection>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<UserResponse>>)> {
        let Json(payload) = payload
            .map_err(|rejection| AppError::from(UserError::BadRequest(rejection.to_string())))?;

        let user = handler.usecase.create(payload).await?;

        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success("User created successfully", user)),
        ))
    }

    /// PUT /api/users/:id
    pub async fn update(
        State(handler): State<Arc<UserHandler>>,
        Path(id): Path<String>,
        payload: Result<Json<UpdateUserRequest>, JsonRejection>,
    ) -> AppResult<Json<ApiResponse<UserResponse>>> {
        let Json(payload) = payload
            .map_err(|rejection| AppError::from(UserError::BadRequest(rejection.to_string())))?;

        let user = handler.usecase.update(id, payload).await?;
        Ok(Json(ApiResponse::success(
            "User updated successfully",
            user,
        )))
    }

    /// DELETE /api/users/:id
    pub async fn delete(
        State(handler): State<Arc<UserHandler>>,
        Path(id): Path<String>,
    ) -> AppResult<Json<ApiResponse<()>>> {
        handler.usecase.delete(id).await?;
        Ok(Json(ApiResponse::success_without_data(
            "User deleted successfully",
        )))
    }
}
