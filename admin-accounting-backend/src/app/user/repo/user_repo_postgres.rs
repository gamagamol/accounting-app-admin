use async_trait::async_trait;
use sqlx::PgPool;

use crate::core::user::entities::{User, UserError};
use crate::core::user::interfaces::{UserFilter, UserRepository};

pub struct PostgresUserRepository {
    pool: PgPool,
}

impl PostgresUserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepository for PostgresUserRepository {
    async fn list(&self, filter: UserFilter) -> Result<(Vec<User>, i64), UserError> {
        let search = filter
            .search
            .as_ref()
            .map(|search| format!("%{}%", search.to_lowercase()));
        let role = filter.role.clone();

        let total: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*)
            FROM users
            WHERE ($1::text IS NULL OR LOWER(name) LIKE $1 OR LOWER(email) LIKE $1)
              AND ($2::text IS NULL OR role = $2)
            "#,
        )
        .bind(search.as_deref())
        .bind(role.as_deref())
        .fetch_one(&self.pool)
        .await
        .map_err(map_sqlx_error)?;

        let users = sqlx::query_as::<_, User>(
            r#"
            SELECT id, name, email, role, avatar, created_at, updated_at
            FROM users
            WHERE ($1::text IS NULL OR LOWER(name) LIKE $1 OR LOWER(email) LIKE $1)
              AND ($2::text IS NULL OR role = $2)
            ORDER BY created_at DESC
            OFFSET $3
            LIMIT $4
            "#,
        )
        .bind(search.as_deref())
        .bind(role.as_deref())
        .bind(filter.offset.max(0))
        .bind(filter.limit.max(0))
        .fetch_all(&self.pool)
        .await
        .map_err(map_sqlx_error)?;

        Ok((users, total))
    }

    async fn get_by_id(&self, id: &str) -> Result<User, UserError> {
        sqlx::query_as::<_, User>(
            r#"
            SELECT id, name, email, role, avatar, created_at, updated_at
            FROM users
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(map_sqlx_error)?
        .ok_or(UserError::NotFound)
    }

    async fn get_by_email(&self, email: &str) -> Result<Option<User>, UserError> {
        sqlx::query_as::<_, User>(
            r#"
            SELECT id, name, email, role, avatar, created_at, updated_at
            FROM users
            WHERE LOWER(email) = LOWER($1)
            "#,
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }

    async fn create(&self, user: &User) -> Result<(), UserError> {
        sqlx::query(
            r#"
            INSERT INTO users (id, name, email, role, avatar, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
        )
        .bind(&user.id)
        .bind(&user.name)
        .bind(&user.email)
        .bind(&user.role)
        .bind(&user.avatar)
        .bind(user.created_at)
        .bind(user.updated_at)
        .execute(&self.pool)
        .await
        .map_err(map_sqlx_error)?;

        Ok(())
    }

    async fn update(&self, user: &User) -> Result<(), UserError> {
        let result = sqlx::query(
            r#"
            UPDATE users
            SET name = $2,
                email = $3,
                role = $4,
                avatar = $5,
                updated_at = $6
            WHERE id = $1
            "#,
        )
        .bind(&user.id)
        .bind(&user.name)
        .bind(&user.email)
        .bind(&user.role)
        .bind(&user.avatar)
        .bind(user.updated_at)
        .execute(&self.pool)
        .await
        .map_err(map_sqlx_error)?;

        if result.rows_affected() == 0 {
            return Err(UserError::NotFound);
        }

        Ok(())
    }

    async fn delete(&self, id: &str) -> Result<(), UserError> {
        let result = sqlx::query("DELETE FROM users WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(map_sqlx_error)?;

        if result.rows_affected() == 0 {
            return Err(UserError::NotFound);
        }

        Ok(())
    }
}

fn map_sqlx_error(error: sqlx::Error) -> UserError {
    if let sqlx::Error::Database(database_error) = &error
        && database_error.code().as_deref() == Some("23505")
    {
        return UserError::EmailExists;
    }

    UserError::Database(error.to_string())
}
