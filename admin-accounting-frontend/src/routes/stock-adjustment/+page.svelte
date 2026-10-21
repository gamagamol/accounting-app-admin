<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { stockAdjustments, inventoryActions } from '$lib/stores/dataStore';
	import { formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'adjustmentNo', label: 'Adjustment No', sortable: true },
		{ key: 'warehouse', label: 'Warehouse', sortable: true },
		{ key: 'productName', label: 'Product', sortable: true },
		{ key: 'systemQty', label: 'System Qty', align: 'right', sortable: true },
		{ key: 'actualQty', label: 'Actual Qty', align: 'right', sortable: true },
		{ key: 'diffQty', label: 'Difference', align: 'right', sortable: true },
		{ key: 'status', label: 'Status', align: 'center' }
	];

	const fields: FieldDef[] = [
		{ key: 'date', label: 'Adjustment Date', type: 'date', required: true },
		{ key: 'adjustmentNo', label: 'Adjustment No', type: 'text', required: true, placeholder: 'ADJ/2024/001' },
		{ key: 'warehouse', label: 'Warehouse', type: 'text' },
		{ key: 'productName', label: 'Product Name', type: 'text', required: true },
		{ key: 'systemQty', label: 'System Quantity', type: 'number' },
		{ key: 'actualQty', label: 'Actual Quantity', type: 'number' },
		{ key: 'diffQty', label: 'Difference', type: 'number' },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			badgeLabels: { pending: 'Pending', approved: 'Approved' },
			options: [
				{ value: 'pending', label: 'Pending' },
				{ value: 'approved', label: 'Approved' }
			]
		},
		{ key: 'reason', label: 'Adjustment Reason', type: 'textarea', colSpan: 'full' }
	];

	function handleSave(payload: Record<string, any>, id?: string) {
		if (id) inventoryActions.updateAdjustment(id, payload);
		else inventoryActions.addAdjustment(payload as any);
	}
</script>

<EntityManager
	title="Stock Adjustment"
	description="Record physical count variances and reconcile system stock against actual warehouse stock."
	entityName="stock adjustment"
	{columns}
	{fields}
	data={$stockAdjustments}
	searchKeys={['adjustmentNo', 'warehouse', 'productName', 'reason', 'status']}
	searchPlaceholder="Search stock adjustments..."
	createLabel="Add Adjustment"
	displayKey="adjustmentNo"
	onSave={handleSave}
	onDelete={(id) => inventoryActions.deleteAdjustment(id)}
/>
