<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { goodsReceipts, goodsReceiptActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatDate } from '$lib/utils/formatters';
	import type { GoodsReceipt, TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'receiptNo', label: 'Receipt No', sortable: true },
		{ key: 'purchaseNo', label: 'Source PO', sortable: true },
		{ key: 'date', label: 'Received Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'supplierName', label: 'Supplier / Vendor', sortable: true },
		{ key: 'preparedBy', label: 'Received By' },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	function openCreate() {
		goto('/goods/new');
	}

	function openEdit(item: GoodsReceipt) {
		goto(`/goods/${item.id}/edit`);
	}

	function openDetail(item: GoodsReceipt) {
		goto(`/goods/${item.id}`);
	}

	function handleDelete(item: GoodsReceipt) {
		if (!confirm(`Delete goods receipt ${item.receiptNo}? This action cannot be undone.`)) return;
		auditLogActions.record({
			module: 'purchase',
			entityType: 'goods_receipt',
			entityId: item.id,
			documentNumber: item.receiptNo,
			action: 'delete',
			actor: $user?.name || 'Warehouse Admin',
			summary: `Deleted goods receipt ${item.receiptNo}.`,
			before: item as unknown as Record<string, unknown>
		});
		goodsReceiptActions.delete(item.id);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Goods Receipts"
			description="Physical inspection of goods received from vendors against purchase orders."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>Record Goods Receipt</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$goodsReceipts}
		searchPlaceholder="Search receipts by receipt number, PO or supplier..."
		searchKeys={['receiptNo', 'purchaseNo', 'supplierName', 'preparedBy']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'receiptNo'}
				<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
					{value}
				</span>
			{:else if column.key === 'purchaseNo'}
				<span class="font-mono text-gray-700 dark:text-gray-200 font-semibold">{value}</span>
			{:else if column.key === 'status'}
				<Badge status={value} />
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View goods receipt details"
				onEdit={() => openEdit(row)}
				editTitle="Edit goods receipt"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete goods receipt"
			/>
		</svelte:fragment>
	</DataTable>
</div>
