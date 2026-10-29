use chrono::{DateTime, Utc};

pub fn now() -> DateTime<Utc> {
    Utc::now()
}

pub fn format_rfc3339(dt: &DateTime<Utc>) -> String {
    dt.to_rfc3339()
}
