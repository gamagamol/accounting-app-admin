use admin_accounting_backend::{app, config};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let config = config::Config::from_env()?;
    app::server::run(config).await
}
