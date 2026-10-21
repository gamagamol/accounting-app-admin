<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { departments, departmentActions } from '$lib/stores/dataStore';
	import { departmentsApi } from '$lib/api';
	import type { TableColumn } from '$lib/types';
	import type { CreateDepartmentPayload } from '$lib/api/types';

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Dept Code', sortable: true },
		{ key: 'name', label: 'Department Name', sortable: true },
		{ key: 'manager', label: 'Manager', sortable: true },
		{ key: 'costCenter', label: 'Cost Center' },
		{ key: 'status', label: 'Status', align: 'center' }
	];

	const fields: FieldDef[] = [
		{ key: 'code', label: 'Department Code', type: 'text', required: true, placeholder: 'OPS' },
		{ key: 'name', label: 'Department Name', type: 'text', required: true, placeholder: 'Operations & Production' },
		{ key: 'manager', label: 'Department Manager', type: 'text' },
		{ key: 'costCenter', label: 'Cost Center', type: 'text', placeholder: 'CC-OPS-01' },
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
			if (id) {
				await departmentsApi.update(id, payload as Partial<CreateDepartmentPayload>);
				departmentActions.update(id, payload);
			} else {
				await departmentsApi.create(payload as CreateDepartmentPayload);
				departmentActions.add(payload as CreateDepartmentPayload);
			}
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save department.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await departmentsApi.delete(id);
			departmentActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete department.');
		}
	}
</script>

<EntityManager
	title="Departments & Cost Centers"
	description="Master data for budget ownership, budget allocation and expense accountability."
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
