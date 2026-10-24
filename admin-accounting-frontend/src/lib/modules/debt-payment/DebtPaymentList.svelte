<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { debtPayments, debtPaymentActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { DebtPayment, TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'paymentNo', label: 'Payment Voucher No', sortable: true },
		{ key: 'date', label: 'Payment Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'supplierName', label: 'Vendor / Supplier', sortable: true },
		{ key: 'purchaseNo', label: 'PO Ref' },
		{ key: 'method', label: 'Method' },
		{ key: 'amount', label: 'Amount Paid', sortable: true, align: 'right', format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	function openCreate() {
		goto('/vendor-payment/new');
	}

	function openEdit(item: DebtPayment) {
		goto(`/vendor-payment/${item.id}/edit`);
	}

	function openDetail(item: DebtPayment) {
		goto(`/vendor-payment/${item.id}`);
	}

	function handleDelete(item: DebtPayment) {
		if (!confirm(`Delete vendor payment ${item.paymentNo}? This action cannot be undone.`)) return;
		auditLogActions.record({
			module: 'purchase',
			entityType: 'vendor_payment',
			entityId: item.id,
			documentNumber: item.paymentNo,
			action: 'delete',
			actor: $user?.name || 'Finance Team',
			summary: `Deleted vendor payment ${item.paymentNo}.`,
			before: item as unknown as Record<string, unknown>
		});
		debtPaymentActions.delete(item.id);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Vendor Payments"
			description="Record cash disbursements settling supplier invoices against purchase orders."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>Record Vendor Payment</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$debtPayments}
		searchPlaceholder="Search vendor payments by number, supplier or PO..."
		searchKeys={['paymentNo', 'supplierName', 'purchaseNo', 'preparedBy']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'paymentNo'}
				<span class="font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">
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
				viewTitle="View payment voucher"
				onEdit={() => openEdit(row)}
				editTitle="Edit payment voucher"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete payment voucher"
			/>
		</svelte:fragment>
	</DataTable>
</div>
