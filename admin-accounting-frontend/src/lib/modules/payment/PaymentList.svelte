<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { payments, paymentActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { Payment, TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'paymentNo', label: 'Receipt No', sortable: true },
		{ key: 'date', label: 'Payment Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'invoiceNo', label: 'Invoice Ref' },
		{ key: 'method', label: 'Method' },
		{ key: 'amount', label: 'Amount Received', sortable: true, align: 'right', format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	function openCreate() {
		goto('/customer-receipt/new');
	}

	function openEdit(item: Payment) {
		goto(`/customer-receipt/${item.id}/edit`);
	}

	function openDetail(item: Payment) {
		goto(`/customer-receipt/${item.id}`);
	}

	function handleDelete(item: Payment) {
		if (!confirm(`Delete payment receipt ${item.paymentNo}? This action cannot be undone.`)) return;
		auditLogActions.record({
			module: 'sales',
			entityType: 'customer_receipt',
			entityId: item.id,
			documentNumber: item.paymentNo,
			action: 'delete',
			actor: $user?.name || 'Finance Team',
			summary: `Deleted customer receipt ${item.paymentNo}.`,
			before: item as unknown as Record<string, unknown>
		});
		paymentActions.delete(item.id);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Customer Receipts"
			description="Record incoming customer payments, issue receipts and update receivable balances in the general ledger."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>Record Receipt</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$payments}
		searchPlaceholder="Search receipts by number, customer or invoice..."
		searchKeys={['paymentNo', 'customerName', 'invoiceNo', 'preparedBy']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'paymentNo'}
				<span class="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
					{value}
				</span>
			{:else if column.key === 'method'}
				<span class="uppercase text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
					{value}
				</span>
			{:else if column.key === 'status'}
				<Badge status={value} />
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View and print receipt"
				onEdit={() => openEdit(row)}
				editTitle="Edit receipt"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete receipt"
			/>
		</svelte:fragment>
	</DataTable>
</div>
