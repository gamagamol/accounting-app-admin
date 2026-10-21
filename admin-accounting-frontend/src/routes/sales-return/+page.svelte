<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { salesReturns, salesReturnActions } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'returnNo', label: 'Return No', sortable: true },
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'salesNo', label: 'Sales Order Ref', sortable: true },
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'reason', label: 'Return Reason' },
		{ key: 'total', label: 'Credit Amount', align: 'right', sortable: true, format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center' }
	];

	const fields: FieldDef[] = [
		{ key: 'returnNo', label: 'Return / Credit Note No', type: 'text', required: true, placeholder: 'SR/2024/001' },
		{ key: 'date', label: 'Return Date', type: 'date', required: true },
		{ key: 'salesNo', label: 'Sales Order Reference', type: 'text' },
		{ key: 'customerName', label: 'Customer Name', type: 'text', required: true },
		{ key: 'reason', label: 'Return Reason', type: 'textarea', colSpan: 'full' },
		{ key: 'total', label: 'Credit Amount', type: 'currency', required: true },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			badgeLabels: { pending: 'Pending', approved: 'Approved', completed: 'Completed' },
			options: [
				{ value: 'pending', label: 'Pending' },
				{ value: 'approved', label: 'Approved' },
				{ value: 'completed', label: 'Completed' }
			]
		}
	];

	function handleSave(payload: Record<string, any>, id?: string) {
		if (id) salesReturnActions.update(id, payload);
		else salesReturnActions.add(payload as any);
	}
</script>

<EntityManager
	title="Sales Return / Credit Note"
	description="Record returned goods and issue credit notes to customers."
	entityName="sales return"
	{columns}
	{fields}
	data={$salesReturns}
	searchKeys={['returnNo', 'salesNo', 'customerName', 'reason', 'status']}
	searchPlaceholder="Search sales returns..."
	createLabel="New Sales Return"
	displayKey="returnNo"
	onSave={handleSave}
	onDelete={(id) => salesReturnActions.delete(id)}
/>
