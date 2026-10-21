use std::sync::Arc;

use admin_accounting_backend::app::{modules, server::build_app, user::repo::MemoryUserRepository};
use admin_accounting_backend::config::Config;
use axum::Router;
use axum::body::{Body, to_bytes};
use axum::http::{Method, Request, StatusCode, header};
use serde_json::{Value, json};
use tower::ServiceExt;

fn test_app() -> Router {
    let config = Arc::new(Config::default());
    let repo = Arc::new(MemoryUserRepository::new());
    let user_module = modules::init_user(repo);
    build_app(config, user_module.handler)
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
async fn health_endpoint_returns_ok() {
    let (status, payload) = send(test_app(), Method::GET, "/health", None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["success"], true);
    assert_eq!(payload["data"]["database"], "memory");
}

#[tokio::test]
async fn user_crud_flow() {
    let app = test_app();

    let (status, payload) =
        send(app.clone(), Method::GET, "/api/users?page=1&limit=10", None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["meta"]["total"], 4);

    let (status, created) = send(
        app.clone(),
        Method::POST,
        "/api/users",
        Some(json!({
            "name": "Route Test",
            "email": "Route.Test@Byond.co.id",
            "role": "SALES_ADMIN",
            "avatar": ""
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(created["data"]["email"], "route.test@byond.co.id");

    let id = created["data"]["id"]
        .as_str()
        .expect("created user id")
        .to_string();

    let (status, payload) = send(
        app.clone(),
        Method::POST,
        "/api/users",
        Some(json!({
            "name": "Duplicate Route",
            "email": "route.test@byond.co.id",
            "role": "OWNER",
            "avatar": ""
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(payload["message"], "Email is already registered");

    let (status, payload) = send(app.clone(), Method::GET, &format!("/api/users/{id}"), None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["data"]["name"], "Route Test");

    let (status, updated) = send(
        app.clone(),
        Method::PUT,
        &format!("/api/users/{id}"),
        Some(json!({
            "name": "Route Test Updated",
            "email": "route.updated@byond.co.id",
            "role": "ACCOUNTING_ADMIN",
            "avatar": "https://example.com/avatar.png"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(updated["data"]["name"], "Route Test Updated");
    assert_eq!(updated["data"]["role"], "ACCOUNTING_ADMIN");

    let (status, payload) = send(
        app.clone(),
        Method::GET,
        "/api/users?search=Route&role=ACCOUNTING_ADMIN&page=1&limit=5",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(payload["meta"]["total"], 1);

    let (status, payload) = send(
        app.clone(),
        Method::POST,
        "/api/users",
        Some(json!({
            "name": "",
            "email": "not-an-email",
            "role": "NOT_A_ROLE",
            "avatar": ""
        })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(payload["message"], "Validation failed");
    assert!(payload["errors"]["name"].is_string());
    assert!(payload["errors"]["email"].is_string());

    let (status, _) = send(
        app.clone(),
        Method::DELETE,
        &format!("/api/users/{id}"),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let (status, payload) = send(app, Method::GET, &format!("/api/users/{id}"), None).await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    assert_eq!(payload["message"], "User not found");
}
