<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { productAccountMappings, inventoryActions } from '$lib/stores/dataStore';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'category', label: 'Product Category', sortable: true },
		{ key: 'inventoryAccount', label: 'Inventory Account' },
		{ key: 'salesAccount', label: 'Sales Account' },
		{ key: 'cogsAccount', label: 'COGS Account' },
		{ key: 'returnAccount', label: 'Return Account' }
	];

	const fields: FieldDef[] = [
		{ key: 'category', label: 'Product Category', type: 'text', required: true, placeholder: 'Raw Materials' },
		{ key: 'inventoryAccount', label: 'Inventory Account', type: 'text' },
		{ key: 'salesAccount', label: 'Sales Account', type: 'text' },
		{ key: 'cogsAccount', label: 'COGS Account', type: 'text' },
		{ key: 'returnAccount', label: 'Return Account', type: 'text' }
	];

	function handleSave(payload: Record<string, any>, id?: string) {
		if (id) inventoryActions.updateMapping(id, payload);
		else inventoryActions.addMapping(payload as any);
	}
</script>

<EntityManager
	title="Product Account Mapping"
	description="Map product categories to their inventory, revenue, cost of goods sold and return accounts."
	entityName="account mapping"
	{columns}
	{fields}
	data={$productAccountMappings}
	searchKeys={['category', 'inventoryAccount', 'salesAccount', 'cogsAccount', 'returnAccount']}
	searchPlaceholder="Search account mappings..."
	createLabel="Add Mapping"
	displayKey="category"
	onSave={handleSave}
	onDelete={(id) => inventoryActions.deleteMapping(id)}
/>
