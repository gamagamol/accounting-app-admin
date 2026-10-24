<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { purchaseOrders, purchaseActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { PurchaseOrder, TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'purchaseNo', label: 'PO No', sortable: true },
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'supplierName', label: 'Supplier / Vendor', sortable: true },
		{ key: 'preparedBy', label: 'Purchasing Staff' },
		{ key: 'total', label: 'Total Amount', sortable: true, align: 'right', format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	function openCreate() {
		goto('/purchase/new');
	}

	function openEdit(item: PurchaseOrder) {
		goto(`/purchase/${item.id}/edit`);
	}

	function openDetail(item: PurchaseOrder) {
		goto(`/purchase/${item.id}`);
	}

	function handleDelete(item: PurchaseOrder) {
		if (!confirm(`Delete purchase order ${item.purchaseNo}? This action cannot be undone.`)) return;
		auditLogActions.record({
			module: 'purchase',
			entityType: 'purchase_order',
			entityId: item.id,
			documentNumber: item.purchaseNo,
			action: 'delete',
			actor: $user?.name || 'Purchasing Staff',
			summary: `Deleted purchase order ${item.purchaseNo}.`,
			before: item as unknown as Record<string, unknown>
		});
		purchaseActions.delete(item.id);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Purchase Orders"
			description="Procurement of goods and raw materials from suppliers and partner vendors."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>New Purchase Order</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$purchaseOrders}
		searchPlaceholder="Search purchase orders by number, supplier or transaction number..."
		searchKeys={['purchaseNo', 'supplierName', 'transactionNo', 'preparedBy']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'purchaseNo'}
				<span class="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
					{value}
				</span>
			{:else if column.key === 'status'}
				<Badge
					status={value}
					label={value === 'pending' ? 'Pending' : value === 'completed' ? 'Received' : 'Completed'}
				/>
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View purchase order & receipt"
				onEdit={() => openEdit(row)}
				editTitle="Edit purchase order"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete purchase order"
			/>
		</svelte:fragment>
	</DataTable>
</div>
