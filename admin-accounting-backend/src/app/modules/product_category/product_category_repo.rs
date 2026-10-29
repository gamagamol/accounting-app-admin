use async_trait::async_trait;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, Condition, DatabaseConnection, EntityTrait, PaginatorTrait,
    QueryFilter, QueryOrder, Set,
};

use super::product_category_dto::ProductCategoryData;
use super::product_category_entity::{
    ActiveModel, Column, Entity, ProductCategory, ProductCategoryFilter,
};
use super::product_category_interface::IProductCategoryRepo;

pub struct ProductCategoryRepo {
    db: DatabaseConnection,
}

impl ProductCategoryRepo {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl IProductCategoryRepo for ProductCategoryRepo {
    async fn find_all(
        &self,
        filter: ProductCategoryFilter,
    ) -> Result<(Vec<ProductCategory>, u64), String> {
        let mut query = Entity::find();

        if let Some(search) = filter.search.as_deref() {
            let term = format!("%{}%", search);
            query = query.filter(
                Condition::any()
                    .add(Column::Code.ilike(&term))
                    .add(Column::Name.ilike(&term)),
            );
        }

        let paginator = query
            .order_by_asc(Column::Code)
            .paginate(&self.db, filter.limit.max(1));

        let total = paginator.num_items().await.map_err(|e| e.to_string())?;
        let items = paginator
            .fetch_page(filter.page.saturating_sub(1))
            .await
            .map_err(|e| e.to_string())?;

        Ok((items, total))
    }

    async fn find_by_id(&self, id: i64) -> Result<Option<ProductCategory>, String> {
        Entity::find_by_id(id)
            .one(&self.db)
            .await
            .map_err(|e| e.to_string())
    }

    async fn find_by_code(&self, code: &str) -> Result<Option<ProductCategory>, String> {
        Entity::find()
            .filter(Column::Code.eq(code))
            .one(&self.db)
            .await
            .map_err(|e| e.to_string())
    }

    async fn create(&self, data: &ProductCategoryData) -> Result<ProductCategory, String> {
        let active = ActiveModel {
            code: Set(data.code.clone()),
            name: Set(data.name.clone()),
            description: Set(data.description.clone()),
            ..Default::default()
        };

        active.insert(&self.db).await.map_err(|e| e.to_string())
    }

    async fn update(&self, id: i64, data: &ProductCategoryData) -> Result<ProductCategory, String> {
        let active = ActiveModel {
            id: Set(id),
            code: Set(data.code.clone()),
            name: Set(data.name.clone()),
            description: Set(data.description.clone()),
            ..Default::default()
        };

        active.update(&self.db).await.map_err(|e| e.to_string())
    }

    async fn delete(&self, id: i64) -> Result<bool, String> {
        let result = Entity::delete_by_id(id)
            .exec(&self.db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(result.rows_affected > 0)
    }
}
