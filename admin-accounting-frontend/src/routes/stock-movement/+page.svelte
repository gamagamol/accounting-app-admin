<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import { stockMovements, inventoryActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { stockMovementFields } from '$lib/modules/inventory/fields';
	import { formatDate, formatNumber } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'docNo', label: 'Document No', sortable: true },
		{ key: 'productName', label: 'Product', sortable: true },
		{ key: 'type', label: 'Movement', align: 'center' },
		{ key: 'warehouse', label: 'Warehouse', sortable: true },
		{ key: 'quantity', label: 'Qty', align: 'right', format: (v, r) => `${formatNumber(Number(v) || 0)} ${r.unit ?? ''}` },
		{ key: 'reference', label: 'Reference' },
		{ key: 'status', label: 'Status', align: 'center' }
	];

	function handleDelete(id: string) {
		const item = $stockMovements.find((movement) => movement.id === id);
		if (!item) return;
		auditLogActions.record({
			module: 'inventory',
			entityType: 'stock_movement',
			entityId: item.id,
			documentNumber: item.docNo,
			action: 'delete',
			actor: $user?.name || 'Warehouse Team',
			summary: `Deleted stock movement ${item.docNo}.`,
			before: item as unknown as Record<string, unknown>
		});
		inventoryActions.deleteMovement(id);
	}
</script>

<EntityManager
	title="Stock Movement"
	description="Track every stock in, stock out, transfer and adjustment movement across warehouses."
	entityName="stock movement"
	{columns}
	fields={stockMovementFields}
	data={$stockMovements}
	searchKeys={['docNo', 'productCode', 'productName', 'type', 'warehouse', 'reference', 'status']}
	searchPlaceholder="Search stock movements..."
	createLabel="Record Movement"
	displayKey="docNo"
	createHref="/stock-movement/new"
	viewHref={(row) => `/stock-movement/${row.id}`}
	editHref={(row) => `/stock-movement/${row.id}/edit`}
	onDelete={handleDelete}
/>
