use std::sync::Arc;

use axum::Json;
use axum::extract::{Extension, Path, Query};
use axum::http::StatusCode;

use super::users_dto::{CreateUserDto, ListUsersQuery, UpdateUserDto, UserResponse};
use super::users_interfaces::IUserUsecase;
use crate::pkg::constans::user_module_constants::{USER_NAME_MAX_LENGTH, USER_VALID_ROLES};
use crate::pkg::response::response_error::{AppError, AppResult};
use crate::pkg::response::response_success::ApiResponse;
use crate::pkg::types::Email;

pub struct UserHandler;

impl UserHandler {
    pub async fn list(
        Extension(usecase): Extension<Arc<dyn IUserUsecase>>,
        Query(query): Query<ListUsersQuery>,
    ) -> AppResult<Json<ApiResponse<Vec<UserResponse>>>> {
        let (users, meta) = usecase.list(query).await?;
        Ok(Json(ApiResponse::paginated(
            "Users retrieved successfully",
            users,
            meta,
        )))
    }

    pub async fn get_by_id(
        Extension(usecase): Extension<Arc<dyn IUserUsecase>>,
        Path(id): Path<String>,
    ) -> AppResult<Json<ApiResponse<UserResponse>>> {
        let user = usecase.get_by_id(&id).await?;
        Ok(Json(ApiResponse::success(
            "User retrieved successfully",
            user,
        )))
    }

    pub async fn create(
        Extension(usecase): Extension<Arc<dyn IUserUsecase>>,
        Json(dto): Json<CreateUserDto>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<UserResponse>>)> {
        // Validasi input (bentuk data) dilakukan di handler.
        let dto = CreateUserDto {
            name: validate_name(&dto.name)?,
            email: validate_email(&dto.email)?,
            role: validate_role(&dto.role)?,
            avatar: dto.avatar,
        };

        let created = usecase.create(dto).await?;
        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success("User created successfully", created)),
        ))
    }

    pub async fn update(
        Extension(usecase): Extension<Arc<dyn IUserUsecase>>,
        Path(id): Path<String>,
        Json(dto): Json<UpdateUserDto>,
    ) -> AppResult<Json<ApiResponse<UserResponse>>> {
        let dto = UpdateUserDto {
            name: dto.name.as_deref().map(validate_name).transpose()?,
            email: dto.email.as_deref().map(validate_email).transpose()?,
            role: dto.role.as_deref().map(validate_role).transpose()?,
            avatar: dto.avatar,
        };

        let updated = usecase.update(&id, dto).await?;
        Ok(Json(ApiResponse::success(
            "User updated successfully",
            updated,
        )))
    }

    pub async fn delete(
        Extension(usecase): Extension<Arc<dyn IUserUsecase>>,
        Path(id): Path<String>,
    ) -> AppResult<Json<ApiResponse<()>>> {
        usecase.delete(&id).await?;
        Ok(Json(ApiResponse::success("User deleted successfully", ())))
    }
}

fn validate_name(name: &str) -> Result<String, AppError> {
    let name = name.trim();

    if name.is_empty() {
        return Err(AppError::BadRequest("Name is required".to_string()));
    }

    if name.chars().count() > USER_NAME_MAX_LENGTH {
        return Err(AppError::BadRequest(format!(
            "Name must be at most {USER_NAME_MAX_LENGTH} characters"
        )));
    }

    Ok(name.to_string())
}

fn validate_email(email: &str) -> Result<String, AppError> {
    Email::parse(email)
        .map(|email| email.0)
        .map_err(AppError::BadRequest)
}

fn validate_role(role: &str) -> Result<String, AppError> {
    let role = role.trim().to_uppercase();

    if !USER_VALID_ROLES.contains(&role.as_str()) {
        return Err(AppError::BadRequest("Invalid user role".to_string()));
    }

    Ok(role)
}
