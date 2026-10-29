use async_trait::async_trait;

use super::master_data_dto::MasterDataOptions;
use crate::pkg::response::response_error::AppError;

#[async_trait]
pub trait IMasterDataRepo: Send + Sync {
    async fn options(&self) -> Result<MasterDataOptions, String>;
}

#[async_trait]
pub trait IMasterDataUsecase: Send + Sync {
    async fn options(&self) -> Result<MasterDataOptions, AppError>;
}
