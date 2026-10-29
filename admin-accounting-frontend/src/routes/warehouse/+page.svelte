<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { warehouses, warehouseActions } from '$lib/stores/dataStore';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Warehouse Code', sortable: true },
		{ key: 'name', label: 'Warehouse Name', sortable: true },
		{ key: 'location', label: 'Location', sortable: true },
		{ key: 'manager', label: 'Manager', sortable: true },
		{ key: 'capacity', label: 'Capacity', align: 'center' },
		{ key: 'status', label: 'Status', align: 'center' }
	];

	const fields: FieldDef[] = [
		{ key: 'code', label: 'Warehouse Code', type: 'text', required: true, placeholder: 'WH-JKT-01' },
		{ key: 'name', label: 'Warehouse Name', type: 'text', required: true },
		{ key: 'location', label: 'Location', type: 'text' },
		{ key: 'manager', label: 'Warehouse Manager', type: 'text' },
		{ key: 'capacity', label: 'Capacity', type: 'text', placeholder: '5,000 m3' },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			badgeLabels: { active: 'Active', inactive: 'Inactive' },
			options: [
				{ value: 'active', label: 'Active' },
				{ value: 'inactive', label: 'Inactive' }
			]
		}
	];

	async function handleSave(payload: Record<string, any>, id?: string) {
		try {
			if (id) await warehouseActions.update(id, payload);
			else await warehouseActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save warehouse.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await warehouseActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete warehouse.');
		}
	}
</script>

<EntityManager
	title="Warehouses & Locations"
	description="Manage physical storage locations, capacity and the responsible warehouse manager."
	entityName="warehouse"
	{columns}
	{fields}
	data={$warehouses}
	searchKeys={['code', 'name', 'location', 'manager']}
	searchPlaceholder="Search warehouses..."
	createLabel="Add Warehouse"
	displayKey="name"
	onSave={handleSave}
	onDelete={handleDelete}
/>
