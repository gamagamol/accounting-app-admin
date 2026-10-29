<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { departments, departmentActions, costCenters } from '$lib/stores/dataStore';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Dept Code', sortable: true },
		{ key: 'name', label: 'Department Name', sortable: true },
		{ key: 'manager', label: 'Manager', sortable: true },
		{ key: 'costCenter', label: 'Cost Center' },
		{ key: 'status', label: 'Status', align: 'center' }
	];

	let fields: FieldDef[] = [];

	$: fields = [
		{ key: 'code', label: 'Department Code', type: 'text', required: true, placeholder: 'OPS' },
		{ key: 'name', label: 'Department Name', type: 'text', required: true, placeholder: 'Operations & Production' },
		{ key: 'manager', label: 'Department Manager', type: 'text' },
		{
			key: 'costCenter',
			label: 'Cost Center',
			type: 'select',
			options: $costCenters.map((costCenter) => ({
				value: costCenter.code,
				label: `${costCenter.code} - ${costCenter.name}`
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
			if (id) await departmentActions.update(id, payload);
			else await departmentActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save department.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await departmentActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete department.');
		}
	}
</script>

<EntityManager
	title="Departments"
	description="Master data for budget ownership, budget allocation and expense accountability, including cost center assignment."
	entityName="department"
	{columns}
	{fields}
	data={$departments}
	searchKeys={['code', 'name', 'manager', 'costCenter']}
	searchPlaceholder="Search departments..."
	createLabel="Add Department"
	displayKey="name"
	onSave={handleSave}
	onDelete={handleDelete}
/>
