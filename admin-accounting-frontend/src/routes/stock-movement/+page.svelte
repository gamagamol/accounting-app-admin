<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { stockMovements, inventoryActions } from '$lib/stores/dataStore';
	import { formatDate, formatNumber } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'docNo', label: 'Document No', sortable: true },
		{ key: 'productName', label: 'Product', sortable: true },
		{ key: 'type', label: 'Movement', align: 'center' },
		{ key: 'warehouse', label: 'Warehouse', sortable: true },
		{ key: 'quantity', label: 'Qty', align: 'right', format: (v, r) => `${formatNumber(Number(v) || 0)} ${r.unit ?? ''}` },
		{ key: 'reference', label: 'Reference' }
	];

	const fields: FieldDef[] = [
		{ key: 'date', label: 'Movement Date', type: 'date', required: true },
		{ key: 'docNo', label: 'Document No', type: 'text', required: true, placeholder: 'GR/2024/001' },
		{ key: 'productCode', label: 'Product Code', type: 'text' },
		{ key: 'productName', label: 'Product Name', type: 'text', required: true },
		{
			key: 'type',
			label: 'Movement Type',
			type: 'select',
			badge: true,
			badgeLabels: { IN: 'Stock In', OUT: 'Stock Out', ADJUST: 'Adjustment', TRANSFER: 'Transfer' },
			options: [
				{ value: 'IN', label: 'Stock In' },
				{ value: 'OUT', label: 'Stock Out' },
				{ value: 'ADJUST', label: 'Adjustment' },
				{ value: 'TRANSFER', label: 'Transfer' }
			]
		},
		{ key: 'warehouse', label: 'Warehouse', type: 'text' },
		{ key: 'quantity', label: 'Quantity', type: 'number', required: true },
		{ key: 'unit', label: 'Unit', type: 'text', placeholder: 'Pcs' },
		{ key: 'reference', label: 'Reference Document', type: 'text', colSpan: 'full' }
	];

	function handleSave(payload: Record<string, any>, id?: string) {
		if (id) inventoryActions.updateMovement(id, payload);
		else inventoryActions.addMovement(payload as any);
	}
</script>

<EntityManager
	title="Stock Movement"
	description="Track every stock in, stock out, transfer and adjustment movement across warehouses."
	entityName="stock movement"
	{columns}
	{fields}
	data={$stockMovements}
	searchKeys={['docNo', 'productCode', 'productName', 'type', 'warehouse', 'reference']}
	searchPlaceholder="Search stock movements..."
	createLabel="Record Movement"
	displayKey="docNo"
	onSave={handleSave}
	onDelete={(id) => inventoryActions.deleteMovement(id)}
/>
