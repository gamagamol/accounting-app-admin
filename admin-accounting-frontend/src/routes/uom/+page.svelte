<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { unitsOfMeasurement, unitActions } from '$lib/stores/dataStore';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Code', sortable: true },
		{ key: 'name', label: 'Unit Name', sortable: true },
		{ key: 'category', label: 'Category', sortable: true, align: 'center' },
		{ key: 'description', label: 'Description' }
	];

	const fields: FieldDef[] = [
		{ key: 'code', label: 'Unit Code', type: 'text', required: true, placeholder: 'e.g. PCS, KG, BOX' },
		{ key: 'name', label: 'Unit Name', type: 'text', required: true, placeholder: 'e.g. Pieces' },
		{
			key: 'category',
			label: 'Measurement Category',
			type: 'select',
			options: [
				{ value: 'Count', label: 'Count' },
				{ value: 'Weight', label: 'Weight' },
				{ value: 'Volume', label: 'Volume' },
				{ value: 'Length', label: 'Length' },
				{ value: 'Time', label: 'Time' },
				{ value: 'Service', label: 'Service' }
			]
		},
		{ key: 'description', label: 'Description', type: 'textarea', colSpan: 'full' }
	];

	async function handleSave(payload: Record<string, any>, id?: string) {
		try {
			if (id) await unitActions.update(id, payload);
			else await unitActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save unit.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await unitActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete unit.');
		}
	}
</script>

<EntityManager
	title="Units of Measurement"
	description="Maintain measurement units used by products, inventory movements and transaction lines."
	entityName="unit"
	{columns}
	{fields}
	data={$unitsOfMeasurement}
	searchKeys={['code', 'name', 'category', 'description']}
	searchPlaceholder="Search units..."
	createLabel="Add Unit"
	displayKey="name"
	onSave={handleSave}
	onDelete={handleDelete}
/>
