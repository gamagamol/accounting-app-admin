<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import BillFormModal from './BillFormModal.svelte';
	import BillDetailModal from './BillDetailModal.svelte';
	import { billPayments, billActions } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { BillPayment, TableColumn } from '$lib/types';

	let isFormOpen = false;
	let isDetailOpen = false;
	let selectedBill: BillPayment | null = null;
	let billToEdit: BillPayment | null = null;

	const columns: TableColumn[] = [
		{ key: 'billNo', label: 'Invoice No', sortable: true },
		{ key: 'invoiceNo', label: 'Sales Order No', sortable: true },
		{ key: 'date', label: 'Invoice Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'supplierName', label: 'Customer', sortable: true },
		{ key: 'method', label: 'Method' },
		{ key: 'amount', label: 'Invoice Amount', sortable: true, align: 'right', format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	function openCreate() {
		billToEdit = null;
		isFormOpen = true;
	}

	function openEdit(item: BillPayment) {
		billToEdit = item;
		isFormOpen = true;
	}

	function openDetail(item: BillPayment) {
		selectedBill = item;
		isDetailOpen = true;
	}

	function handleDelete(item: BillPayment) {
		if (confirm(`Delete invoice ${item.billNo}? This action cannot be undone.`)) {
			billActions.delete(item.id);
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Sales Invoices"
			description="Issue customer receivables invoices and monitor settlement status."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>Issue New Invoice</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$billPayments}
		searchPlaceholder="Search invoices by invoice number, SO or customer..."
		searchKeys={['billNo', 'invoiceNo', 'supplierName', 'preparedBy']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'billNo'}
				<span class="font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
					{value}
				</span>
			{:else if column.key === 'method'}
				<span class="uppercase text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
					{value}
				</span>
			{:else if column.key === 'status'}
				<Badge status={value} label={value === 'paid' ? 'Paid' : 'Unpaid'} />
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View invoice and settlement"
				onEdit={() => openEdit(row)}
				editTitle="Edit invoice"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete invoice"
			/>
		</svelte:fragment>
	</DataTable>

	<BillFormModal bind:isOpen={isFormOpen} {billToEdit} />
	<BillDetailModal bind:isOpen={isDetailOpen} bill={selectedBill} />
</div>
