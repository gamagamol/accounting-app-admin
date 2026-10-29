<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { taxRates, taxRateActions } from '$lib/stores/dataStore';
	import { formatPercent } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Tax Code', sortable: true },
		{ key: 'name', label: 'Tax Name', sortable: true },
		{ key: 'rate', label: 'Rate', sortable: true, align: 'center', format: (v) => formatPercent(Number(v) || 0) },
		{ key: 'type', label: 'Tax Type', align: 'center' },
		{ key: 'description', label: 'Description' }
	];

	const fields: FieldDef[] = [
		{ key: 'code', label: 'Tax Code', type: 'text', required: true, placeholder: 'PPN-11' },
		{ key: 'name', label: 'Tax Name', type: 'text', required: true },
		{ key: 'rate', label: 'Rate (%)', type: 'number', required: true },
		{
			key: 'type',
			label: 'Tax Type',
			type: 'select',
			badge: true,
			badgeLabels: { sales: 'Sales', purchase: 'Purchase', withholding: 'Withholding' },
			options: [
				{ value: 'sales', label: 'Sales' },
				{ value: 'purchase', label: 'Purchase' },
				{ value: 'withholding', label: 'Withholding' }
			]
		},
		{ key: 'description', label: 'Description', type: 'textarea', colSpan: 'full' }
	];

	async function handleSave(payload: Record<string, any>, id?: string) {
		try {
			if (id) await taxRateActions.update(id, payload);
			else await taxRateActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save tax rate.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await taxRateActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete tax rate.');
		}
	}
</script>

<EntityManager
	title="Tax Rates"
	description="Configure sales, purchase and withholding tax rates used across transactions."
	entityName="tax rate"
	{columns}
	{fields}
	data={$taxRates}
	searchKeys={['code', 'name', 'type', 'description']}
	searchPlaceholder="Search tax rates..."
	createLabel="Add Tax Rate"
	displayKey="name"
	onSave={handleSave}
	onDelete={handleDelete}
/>
