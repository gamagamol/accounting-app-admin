use tracing_subscriber::EnvFilter;

use crate::config::Config;

/// Initializes the default Rust tracing subscriber.
///
/// This intentionally keeps the built-in text formatter; no custom log files
/// or JSON layout are configured. `RUST_LOG` can override `LOG_LEVEL`.
pub fn init(config: &Config) {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(config.log_level.clone()));

    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_target(false)
        .init();
}
