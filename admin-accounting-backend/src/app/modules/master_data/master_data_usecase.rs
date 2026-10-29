use std::sync::Arc;

use async_trait::async_trait;

use super::master_data_dto::MasterDataOptions;
use super::master_data_interface::{IMasterDataRepo, IMasterDataUsecase};
use crate::pkg::response::response_error::AppError;

pub struct MasterDataUsecase {
    repo: Arc<dyn IMasterDataRepo>,
}

impl MasterDataUsecase {
    pub fn new(repo: Arc<dyn IMasterDataRepo>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl IMasterDataUsecase for MasterDataUsecase {
    async fn options(&self) -> Result<MasterDataOptions, AppError> {
        self.repo.options().await.map_err(AppError::Database)
    }
}
