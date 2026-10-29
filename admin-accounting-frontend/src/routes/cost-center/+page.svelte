<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { costCenters, costCenterActions, departments } from '$lib/stores/dataStore';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Cost Center Code', sortable: true },
		{ key: 'name', label: 'Cost Center Name', sortable: true },
		{ key: 'department', label: 'Department', sortable: true },
		{ key: 'status', label: 'Status', align: 'center' }
	];

	let fields: FieldDef[] = [];

	$: fields = [
		{ key: 'code', label: 'Cost Center Code', type: 'text', required: true, placeholder: 'CC-OPS-01' },
		{ key: 'name', label: 'Cost Center Name', type: 'text', required: true, placeholder: 'Operations Cost Center' },
		{
			key: 'department',
			label: 'Department',
			type: 'select',
			options: $departments.map((department) => ({
				value: department.name,
				label: `${department.code} - ${department.name}`
			}))
		},
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
			if (id) await costCenterActions.update(id, payload);
			else await costCenterActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save cost center.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await costCenterActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete cost center.');
		}
	}
</script>

<EntityManager
	title="Cost Centers"
	description="Maintain cost centers used by employees, journals, budgets and expense allocations."
	entityName="cost center"
	{columns}
	{fields}
	data={$costCenters}
	searchKeys={['code', 'name', 'department', 'status']}
	searchPlaceholder="Search cost centers..."
	createLabel="Add Cost Center"
	displayKey="name"
	onSave={handleSave}
	onDelete={handleDelete}
/>
