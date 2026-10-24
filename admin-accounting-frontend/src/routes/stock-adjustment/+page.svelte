<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import { stockAdjustments, inventoryActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { stockAdjustmentFields } from '$lib/modules/inventory/fields';
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

	function handleDelete(id: string) {
		const item = $stockAdjustments.find((adjustment) => adjustment.id === id);
		if (!item) return;
		auditLogActions.record({
			module: 'inventory',
			entityType: 'stock_adjustment',
			entityId: item.id,
			documentNumber: item.adjustmentNo,
			action: 'delete',
			actor: $user?.name || 'Warehouse Team',
			summary: `Deleted stock adjustment ${item.adjustmentNo}.`,
			before: item as unknown as Record<string, unknown>
		});
		inventoryActions.deleteAdjustment(id);
	}
</script>

<EntityManager
	title="Stock Adjustment"
	description="Record physical count variances and reconcile system stock against actual warehouse stock."
	entityName="stock adjustment"
	{columns}
	fields={stockAdjustmentFields}
	data={$stockAdjustments}
	searchKeys={['adjustmentNo', 'warehouse', 'productName', 'reason', 'status']}
	searchPlaceholder="Search stock adjustments..."
	createLabel="Add Adjustment"
	displayKey="adjustmentNo"
	createHref="/stock-adjustment/new"
	viewHref={(row) => `/stock-adjustment/${row.id}`}
	editHref={(row) => `/stock-adjustment/${row.id}/edit`}
	onDelete={handleDelete}
/>
