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
async fn pending_crud_and_decisions() {
    let app = test_app();

    let (status, created) = send(
        app.clone(),
        Method::POST,
        "/api/pending",
        Some(json!({
            "transactionType": "quotation",
            "transactionId": "qt-001",
            "transactionNumber": "QUO/2026/001",
            "requestedBy": "Ahmad Fauzi",
            "pendingMessage": "Customer asked for a price revision.",
            "actorRole": "SALES_ADMIN"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(created["data"]["status"], "pending");
    assert_eq!(
        created["data"]["pendingMessage"],
        "Customer asked for a price revision."
    );
    assert_eq!(created["data"]["transactionType"], "quotation");

    let pending_id = created["data"]["id"]
        .as_str()
        .expect("created pending id")
        .to_string();

    let (status, listed) = send(
        app.clone(),
        Method::GET,
        "/api/pending?transactionType=quotation&transactionId=qt-001&page=1&limit=10",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(listed["meta"]["total"], 1);
    assert_eq!(listed["data"][0]["requestedBy"], "Ahmad Fauzi");

    let (status, fetched) = send(
        app.clone(),
        Method::GET,
        &format!("/api/pending/quotation/{pending_id}"),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(fetched["data"]["transactionNumber"], "QUO/2026/001");

    let (status, duplicate) = send(
        app.clone(),
        Method::POST,
        "/api/pending",
        Some(json!({
            "transactionType": "quotation",
            "transactionId": "qt-001",
            "transactionNumber": "QUO/2026/001",
            "requestedBy": "Ahmad Fauzi",
            "pendingMessage": "Second request while one is still open."
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(
        duplicate["message"],
        "transaction already has a pending request"
    );

    let (status, approved) = send(
        app.clone(),
        Method::POST,
        &format!("/api/pending/quotation/{pending_id}/approve"),
        Some(json!({
            "actor": "Dewi Sartika",
            "actorRole": "OWNER",
            "decisionMessage": "Approved after checking the margin."
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(approved["data"]["status"], "approved");
    assert_eq!(approved["data"]["approvedBy"], "Dewi Sartika");
    assert_eq!(
        approved["data"]["approvalMessage"],
        "Approved after checking the margin."
    );

    let (status, _decided_again) = send(
        app.clone(),
        Method::POST,
        &format!("/api/pending/quotation/{pending_id}/reject"),
        Some(json!({
            "actor": "Dewi Sartika",
            "actorRole": "OWNER",
            "decisionMessage": "Cannot change a decided request."
        })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);

    let (status, rejected) = send(
        app.clone(),
        Method::POST,
        "/api/pending",
        Some(json!({
            "transactionType": "sales_order",
            "transactionId": "so-001",
            "transactionNumber": "SO/2026/001",
            "requestedBy": "Siti Aminah",
            "message": "Stock reservation needs approval."
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);

    let rejected_id = rejected["data"]["id"]
        .as_str()
        .expect("created rejected id")
        .to_string();

    let (status, rejected) = send(
        app.clone(),
        Method::POST,
        &format!("/api/pending/sales_order/{rejected_id}/reject"),
        Some(json!({
            "actor": "Bambang Soepomo",
            "actorRole": "ACCOUNTING_ADMIN",
            "message": "Stock is not available for this delivery date."
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(rejected["data"]["status"], "rejected");
    assert_eq!(rejected["data"]["rejectedBy"], "Bambang Soepomo");
    assert_eq!(
        rejected["data"]["rejectionMessage"],
        "Stock is not available for this delivery date."
    );
}

#[tokio::test]
async fn pending_validation_and_role_checks() {
    let app = test_app();

    let (status, payload) = send(
        app.clone(),
        Method::POST,
        "/api/pending",
        Some(json!({
            "transactionType": "quotation",
            "transactionId": "qt-002",
            "requestedBy": "Ahmad Fauzi",
            "pendingMessage": ""
        })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(payload["message"], "Validation failed");

    let (status, _payload) = send(
        app.clone(),
        Method::POST,
        "/api/pending",
        Some(json!({
            "transactionType": "not-a-transaction",
            "transactionId": "x",
            "requestedBy": "Ahmad Fauzi",
            "pendingMessage": "Why not?"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);

    let (status, created) = send(
        app.clone(),
        Method::POST,
        "/api/pending",
        Some(json!({
            "transactionType": "quotation",
            "transactionId": "qt-003",
            "requestedBy": "Ahmad Fauzi",
            "pendingMessage": "Needs owner review."
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);

    let pending_id = created["data"]["id"]
        .as_str()
        .expect("created pending id")
        .to_string();

    let (status, payload) = send(
        app.clone(),
        Method::POST,
        &format!("/api/pending/quotation/{pending_id}/approve"),
        Some(json!({
            "actor": "Siti Aminah",
            "actorRole": "SALES_ADMIN",
            "decisionMessage": "Trying to approve my own request."
        })),
    )
    .await;
    assert_eq!(status, StatusCode::FORBIDDEN);
    assert_eq!(
        payload["message"],
        "only an approver or administrator can decide a pending request"
    );

    let (status, _) = send(
        app.clone(),
        Method::GET,
        "/api/pending/quotation/00000000-0000-0000-0000-000000000000",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::NOT_FOUND);

    let (status, _) = send(
        app.clone(),
        Method::GET,
        "/api/pending?transactionType=quotation&status=unknown",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
}
