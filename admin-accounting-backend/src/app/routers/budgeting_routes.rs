use axum::Router;
use axum::routing::{get, post};

use crate::app::modules::budgeting::BudgetingHandler;

pub fn routes() -> Router {
    Router::new()
        .route(
            "/budgeting/budgets",
            get(BudgetingHandler::list_budgets).post(BudgetingHandler::create_budget),
        )
        .route("/budgeting/budgets/{id}", get(BudgetingHandler::get_budget))
        .route(
            "/budgeting/budgets/{id}/approve",
            post(BudgetingHandler::approve_budget),
        )
        .route(
            "/budgeting/allocations",
            get(BudgetingHandler::list_allocations).post(BudgetingHandler::create_allocation),
        )
        .route(
            "/budgeting/allocations/{id}",
            get(BudgetingHandler::get_allocation),
        )
        .route(
            "/budgeting/allocations/{id}/approve",
            post(BudgetingHandler::approve_allocation),
        )
        .route(
            "/budgeting/budget-vs-actual",
            get(BudgetingHandler::budget_vs_actual),
        )
        .route(
            "/expenses",
            get(BudgetingHandler::list_expenses).post(BudgetingHandler::create_expense),
        )
        .route("/expenses/{id}", get(BudgetingHandler::get_expense))
        .route(
            "/expenses/{id}/approve",
            post(BudgetingHandler::approve_expense),
        )
        .route("/expenses/{id}/post", post(BudgetingHandler::post_expense))
}
