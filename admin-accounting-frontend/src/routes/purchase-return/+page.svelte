<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { purchaseReturns, purchaseReturnActions } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'returnNo', label: 'Return No', sortable: true },
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'purchaseNo', label: 'Purchase Order Ref', sortable: true },
		{ key: 'supplierName', label: 'Vendor', sortable: true },
		{ key: 'reason', label: 'Return Reason' },
		{ key: 'total', label: 'Debit Amount', align: 'right', sortable: true, format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center' }
	];

	const fields: FieldDef[] = [
		{ key: 'returnNo', label: 'Return / Debit Note No', type: 'text', required: true, placeholder: 'PR/2024/001' },
		{ key: 'date', label: 'Return Date', type: 'date', required: true },
		{ key: 'purchaseNo', label: 'Purchase Order Reference', type: 'text' },
		{ key: 'supplierName', label: 'Vendor Name', type: 'text', required: true },
		{ key: 'reason', label: 'Return Reason', type: 'textarea', colSpan: 'full' },
		{ key: 'total', label: 'Debit Amount', type: 'currency', required: true },
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
		if (id) purchaseReturnActions.update(id, payload);
		else purchaseReturnActions.add(payload as any);
	}
</script>

<EntityManager
	title="Purchase Return / Debit Note"
	description="Record goods returned to vendors and issue debit notes against purchase invoices."
	entityName="purchase return"
	{columns}
	{fields}
	data={$purchaseReturns}
	searchKeys={['returnNo', 'purchaseNo', 'supplierName', 'reason', 'status']}
	searchPlaceholder="Search purchase returns..."
	createLabel="New Purchase Return"
	displayKey="returnNo"
	onSave={handleSave}
	onDelete={(id) => purchaseReturnActions.delete(id)}
/>
