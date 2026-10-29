use std::sync::Arc;

use axum::Json;
use axum::extract::Extension;

use super::master_data_dto::MasterDataOptions;
use super::master_data_interface::IMasterDataUsecase;
use crate::pkg::response::response_error::AppResult;
use crate::pkg::response::response_success::ApiResponse;

pub struct MasterDataHandler;

impl MasterDataHandler {
    pub async fn options(
        Extension(usecase): Extension<Arc<dyn IMasterDataUsecase>>,
    ) -> AppResult<Json<ApiResponse<MasterDataOptions>>> {
        let options = usecase.options().await?;
        Ok(Json(ApiResponse::success(
            "Master data options retrieved successfully",
            options,
        )))
    }
}
