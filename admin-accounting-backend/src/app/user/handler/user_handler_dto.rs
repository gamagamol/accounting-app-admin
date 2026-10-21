use serde::Deserialize;

#[derive(Debug, Clone, Default, Deserialize)]
pub struct ListUsersQuery {
    pub search: Option<String>,
    pub role: Option<String>,
    pub page: Option<u32>,
    pub limit: Option<u32>,
}
