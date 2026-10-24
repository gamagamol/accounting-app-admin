use std::sync::Arc;

use crate::app::audit::handler::AuditHandler;
use crate::core::audit::interfaces::{AuditRepository, AuditUsecase};
use crate::core::audit::usecases::AuditUsecaseImpl;

pub struct AuditModule {
    pub handler: Arc<AuditHandler>,
    pub usecase: Arc<dyn AuditUsecase>,
}

pub fn init_audit(repo: Arc<dyn AuditRepository>) -> AuditModule {
    let usecase: Arc<dyn AuditUsecase> = Arc::new(AuditUsecaseImpl::new(repo));
    let handler = Arc::new(AuditHandler::new(usecase.clone()));

    AuditModule { handler, usecase }
}
