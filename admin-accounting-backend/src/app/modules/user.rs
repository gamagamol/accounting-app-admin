use std::sync::Arc;

use crate::app::user::handler::UserHandler;
use crate::core::user::interfaces::{UserRepository, UserUsecase};
use crate::core::user::usecases::UserUsecaseImpl;

pub struct UserModule {
    pub handler: Arc<UserHandler>,
    pub usecase: Arc<dyn UserUsecase>,
}

pub fn init_user(repo: Arc<dyn UserRepository>) -> UserModule {
    let usecase: Arc<dyn UserUsecase> = Arc::new(UserUsecaseImpl::new(repo));
    let handler = Arc::new(UserHandler::new(usecase.clone()));

    UserModule { handler, usecase }
}
