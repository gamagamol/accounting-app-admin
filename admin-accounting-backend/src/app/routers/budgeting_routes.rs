use axum::Router;
use axum::routing::{get, post};

use crate::app::modules::budgeting::BudgetingHandler;

pub fn routes() -> Router {
    Router::new()
        .route(
            "/budgeting/budgets",
            get(BudgetingHandler::list_budgets).post(BudgetingHandler::create_budget),
        )
        .route(
            "/budgeting/budgets/{id}",
            get(BudgetingHandler::get_budget)
                .put(BudgetingHandler::update_budget)
                .delete(BudgetingHandler::delete_budget),
        )
        .route(
            "/budgeting/budgets/{id}/submit",
            post(BudgetingHandler::submit_budget),
        )
        .route(
            "/budgeting/budgets/{id}/approve",
            post(BudgetingHandler::approve_budget),
        )
        .route(
            "/budgeting/budgets/{id}/reject",
            post(BudgetingHandler::reject_budget),
        )
        .route(
            "/budgeting/budgets/{id}/close",
            post(BudgetingHandler::close_budget),
        )
        .route(
            "/budgeting/allocations",
            get(BudgetingHandler::list_allocations).post(BudgetingHandler::create_allocation),
        )
        .route(
            "/budgeting/allocations/{id}",
            get(BudgetingHandler::get_allocation)
                .put(BudgetingHandler::update_allocation)
                .delete(BudgetingHandler::delete_allocation),
        )
        .route(
            "/budgeting/allocations/{id}/approve",
            post(BudgetingHandler::approve_allocation),
        )
        .route(
            "/budgeting/allocations/{id}/reject",
            post(BudgetingHandler::reject_allocation),
        )
        .route(
            "/budgeting/budget-vs-actual",
            get(BudgetingHandler::budget_vs_actual),
        )
        .route(
            "/expenses",
            get(BudgetingHandler::list_expenses).post(BudgetingHandler::create_expense),
        )
        .route("/expenses/posted", get(BudgetingHandler::list_posted_expenses))
        .route(
            "/expenses/{id}",
            get(BudgetingHandler::get_expense)
                .put(BudgetingHandler::update_expense)
                .delete(BudgetingHandler::delete_expense),
        )
        .route(
            "/expenses/{id}/submit",
            post(BudgetingHandler::submit_expense),
        )
        .route(
            "/expenses/{id}/approve",
            post(BudgetingHandler::approve_expense),
        )
        .route(
            "/expenses/{id}/reject",
            post(BudgetingHandler::reject_expense),
        )
        .route("/expenses/{id}/post", post(BudgetingHandler::post_expense))
}
