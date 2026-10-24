use std::sync::Arc;

use admin_accounting_backend::app::{
    audit::repo::MemoryAuditRepository, modules, pending::repo::MemoryPendingRepository,
    server::build_app, user::repo::MemoryUserRepository,
};
use admin_accounting_backend::config::Config;
use axum::Router;
use axum::body::{Body, to_bytes};
use axum::http::{Method, Request, StatusCode, header};
use serde_json::{Value, json};
use tower::ServiceExt;

fn test_app() -> Router {
    let config = Arc::new(Config::default());
    let user_module = modules::init_user(Arc::new(MemoryUserRepository::new()));
    let audit_module = modules::init_audit(Arc::new(MemoryAuditRepository::new()));
    let pending_module = modules::init_pending(Arc::new(MemoryPendingRepository::new()));
    build_app(
        config,
        user_module.handler,
        audit_module.handler,
        pending_module.handler,
    )
}

async fn send(
    app: Router,
    method: Method,
    uri: &str,
    payload: Option<Value>,
) -> (StatusCode, Value) {
    let mut builder = Request::builder().method(method).uri(uri);

    let body = match payload {
        Some(payload) => {
            builder = builder.header(header::CONTENT_TYPE, "application/json");
            Body::from(payload.to_string())
        }
        None => Body::empty(),
    };

    let response = app
        .oneshot(builder.body(body).expect("valid request"))
        .await
        .expect("request should succeed");

    let status = response.status();
    let bytes = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("response body should be readable");
    let payload = if bytes.is_empty() {
        Value::Null
    } else {
        serde_json::from_slice(&bytes).expect("response should be JSON")
    };

    (status, payload)
}

#[tokio::test]
async fn audit_crud_flow() {
    let app = test_app();

    let (status, payload) = send(app.clone(), Method::GET, "/api/audit-logs", None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["meta"]["total"], 0);

    let (status, created) = send(
        app.clone(),
        Method::POST,
        "/api/audit-logs",
        Some(json!({
            "module": "sales",
            "entityType": "quotation",
            "entityId": "qt-001",
            "documentNumber": "QUO/2026/001",
            "action": "reopen",
            "status": "reopen",
            "actor": "Ahmad Fauzi",
            "summary": "Reopened completed quotation and recorded a correction.",
            "description": "Customer requested a revised unit price for line 2.",
            "changes": [
                { "field": "status", "before": "completed", "after": "reopen" }
            ]
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(
        created["data"]["description"],
        "Customer requested a revised unit price for line 2."
    );
    assert_eq!(created["data"]["action"], "reopen");

    let id = created["data"]["id"]
        .as_str()
        .expect("created audit id")
        .to_string();

    let (status, payload) = send(
        app.clone(),
        Method::GET,
        "/api/audit-logs?entityType=quotation&entityId=qt-001&page=1&limit=10",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["meta"]["total"], 1);
    assert_eq!(
        payload["data"][0]["description"],
        "Customer requested a revised unit price for line 2."
    );

    let (status, payload) = send(
        app.clone(),
        Method::GET,
        &format!("/api/audit-logs/{id}"),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["data"]["documentNumber"], "QUO/2026/001");

    let (status, payload) = send(
        app.clone(),
        Method::POST,
        "/api/audit-logs",
        Some(json!({
            "module": "sales",
            "entityType": "quotation",
            "entityId": "qt-001",
            "action": "not-an-action",
            "status": "pending",
            "summary": "Invalid action should be rejected."
        })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(payload["message"], "Validation failed");
    assert!(payload["errors"]["action"].is_string());

    let (status, payload) = send(
        app.clone(),
        Method::DELETE,
        "/api/audit-logs/entity/quotation/qt-001",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["data"]["deleted"], 1);

    let (status, _) = send(app, Method::DELETE, &format!("/api/audit-logs/{id}"), None).await;
    assert_eq!(status, StatusCode::NOT_FOUND);
}
