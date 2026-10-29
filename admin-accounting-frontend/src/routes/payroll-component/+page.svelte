<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import {
		payrollComponents,
		payrollComponentActions,
		chartOfAccounts
	} from '$lib/stores/dataStore';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Component Code', sortable: true },
		{ key: 'name', label: 'Component Name', sortable: true },
		{ key: 'componentType', label: 'Type', sortable: true },
		{ key: 'taxable', label: 'Taxable', align: 'center' },
		{ key: 'coaCode', label: 'COA Account', sortable: true },
		{ key: 'isActive', label: 'Status', align: 'center' }
	];

	let fields: FieldDef[] = [];

	$: fields = [
		{ key: 'code', label: 'Component Code', type: 'text', required: true, placeholder: 'BASIC' },
		{ key: 'name', label: 'Component Name', type: 'text', required: true, placeholder: 'Basic Salary' },
		{
			key: 'componentType',
			label: 'Component Type',
			type: 'select',
			options: [
				{ value: 'earning', label: 'Earning' },
				{ value: 'deduction', label: 'Deduction' },
				{ value: 'employer_contribution', label: 'Employer Contribution' }
			]
		},
		{
			key: 'taxable',
			label: 'Taxable',
			type: 'select',
			options: [
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]
		},
		{
			key: 'coaCode',
			label: 'COA Account',
			type: 'select',
			options: $chartOfAccounts.map((account) => ({
				value: account.code,
				label: `${account.code} - ${account.name}`
			}))
		},
		{
			key: 'isActive',
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
			if (id) await payrollComponentActions.update(id, payload);
			else await payrollComponentActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save payroll component.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await payrollComponentActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete payroll component.');
		}
	}
</script>

<EntityManager
	title="Payroll Components"
	description="Define earnings, deductions and employer contributions used by payroll runs."
	entityName="payroll component"
	{columns}
	{fields}
	data={$payrollComponents}
	searchKeys={['code', 'name', 'componentType', 'coaCode']}
	searchPlaceholder="Search payroll components..."
	createLabel="Add Component"
	displayKey="name"
	onSave={handleSave}
	onDelete={handleDelete}
/>
