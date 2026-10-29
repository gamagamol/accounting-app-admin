pub mod middleware {
    pub mod cors;
    pub mod jwt;
}

#[path = "modules/modules.rs"]
pub mod modules;

pub mod routers {
    pub mod audit_log_routes;
    pub mod budgeting_routes;
    pub mod journal_routes;
    pub mod master_data_routes;
    pub mod period_routes;
    pub mod report_route;
    pub mod routes;
    pub mod transaction_route;
}

pub use routers::routes::build_routes;
