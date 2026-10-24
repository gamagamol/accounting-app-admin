<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { salesOrders, salesActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { SalesOrder, TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'salesNo', label: 'Sales Order No', sortable: true },
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'preparedBy', label: 'Prepared By' },
		{ key: 'total', label: 'Order Total', sortable: true, align: 'right', format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	function openCreate() {
		goto('/sales/new');
	}

	function openEdit(item: SalesOrder) {
		goto(`/sales/${item.id}/edit`);
	}

	function openDetail(item: SalesOrder) {
		goto(`/sales/${item.id}`);
	}

	function handleDelete(item: SalesOrder) {
		if (!confirm(`Delete sales order ${item.salesNo}? This action cannot be undone.`)) return;
		auditLogActions.record({
			module: 'sales',
			entityType: 'sales_order',
			entityId: item.id,
			documentNumber: item.salesNo,
			action: 'delete',
			actor: $user?.name || 'Sales Admin',
			summary: `Deleted sales order ${item.salesNo}.`,
			before: item as unknown as Record<string, unknown>
		});
		salesActions.delete(item.id);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Sales Orders"
			description="Active customer orders, delivery workflow and invoice issuance."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>New Sales Order</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$salesOrders}
		searchPlaceholder="Search orders by SO number, customer or transaction number..."
		searchKeys={['salesNo', 'customerName', 'transactionNo', 'preparedBy']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'salesNo'}
				<span class="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
					{value}
				</span>
			{:else if column.key === 'status'}
				<Badge
					status={value}
					label={value === 'pending' ? 'Processing' : value === 'completed' ? 'Delivered' : value === 'created' ? 'Shipped' : 'Completed'}
				/>
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View sales order details"
				onEdit={() => openEdit(row)}
				editTitle="Edit sales order"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete sales order"
			/>
		</svelte:fragment>
	</DataTable>
</div>
