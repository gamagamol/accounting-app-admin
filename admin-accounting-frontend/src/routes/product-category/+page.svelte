<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { productCategories, productCategoryActions } from '$lib/stores/dataStore';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Category Code', sortable: true },
		{ key: 'name', label: 'Category Name', sortable: true },
		{ key: 'description', label: 'Description' }
	];

	const fields: FieldDef[] = [
		{ key: 'code', label: 'Category Code', type: 'text', required: true, placeholder: 'RAW-MAT' },
		{ key: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'Raw Materials' },
		{
			key: 'description',
			label: 'Description',
			type: 'textarea',
			colSpan: 'full',
			placeholder: 'Describe how products in this category are used.'
		}
	];

	async function handleSave(payload: Record<string, any>, id?: string) {
		try {
			if (id) await productCategoryActions.update(id, payload);
			else await productCategoryActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save product category.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await productCategoryActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete product category.');
		}
	}
</script>

<EntityManager
	title="Product Category"
	description="Classify goods and services for reporting, account mapping and catalogue filtering."
	entityName="product category"
	{columns}
	{fields}
	data={$productCategories}
	searchKeys={['code', 'name', 'description']}
	searchPlaceholder="Search product categories..."
	createLabel="Add Category"
	displayKey="name"
	onSave={handleSave}
	onDelete={handleDelete}
/>
