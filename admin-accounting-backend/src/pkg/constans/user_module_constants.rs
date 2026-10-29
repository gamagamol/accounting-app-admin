// Konstanta khusus module users.
pub const USER_CACHE_PREFIX: &str = "user";

pub const USER_NAME_MAX_LENGTH: usize = 100;

pub const USER_ROLE_SUPER_ADMIN: &str = "SUPER_ADMIN";
pub const USER_ROLE_SALES_ADMIN: &str = "SALES_ADMIN";
pub const USER_ROLE_ACCOUNTING_ADMIN: &str = "ACCOUNTING_ADMIN";
pub const USER_ROLE_OWNER: &str = "OWNER";

pub const USER_VALID_ROLES: [&str; 4] = [
    USER_ROLE_SUPER_ADMIN,
    USER_ROLE_SALES_ADMIN,
    USER_ROLE_ACCOUNTING_ADMIN,
    USER_ROLE_OWNER,
];
