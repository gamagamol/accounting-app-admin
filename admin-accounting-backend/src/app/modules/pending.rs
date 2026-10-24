use std::sync::Arc;

use crate::app::pending::handler::PendingHandler;
use crate::core::pending::interfaces::{PendingRepository, PendingUsecase};
use crate::core::pending::usecases::PendingUsecaseImpl;

pub struct PendingModule {
    pub handler: Arc<PendingHandler>,
    pub usecase: Arc<dyn PendingUsecase>,
}

pub fn init_pending(repo: Arc<dyn PendingRepository>) -> PendingModule {
    let usecase: Arc<dyn PendingUsecase> = Arc::new(PendingUsecaseImpl::new(repo));
    let handler = Arc::new(PendingHandler::new(usecase.clone()));

    PendingModule { handler, usecase }
}
