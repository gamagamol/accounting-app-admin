<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import QuotationFormModal from './QuotationFormModal.svelte';
	import QuotationDetailModal from './QuotationDetailModal.svelte';
	import { quotations, quotationActions } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { Quotation, TableColumn } from '$lib/types';

	let isFormOpen = false;
	let isDetailOpen = false;
	let selectedQuotation: Quotation | null = null;
	let quotationToEdit: Quotation | null = null;

	const columns: TableColumn[] = [
		{ key: 'quotationNo', label: 'Quotation No', sortable: true },
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'salesPerson', label: 'Salesperson' },
		{ key: 'total', label: 'Total Amount', sortable: true, align: 'right', format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	function openCreate() {
		quotationToEdit = null;
		isFormOpen = true;
	}

	function openEdit(item: Quotation) {
		quotationToEdit = item;
		isFormOpen = true;
	}

	function openDetail(item: Quotation) {
		selectedQuotation = item;
		isDetailOpen = true;
	}

	function handleDelete(item: Quotation) {
		if (confirm(`Delete quotation ${item.quotationNo}? This action cannot be undone.`)) {
			quotationActions.delete(item.id);
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Sales Quotations"
			description="Manage price proposals sent to prospects and customers before they become sales orders."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>New Quotation</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$quotations}
		searchPlaceholder="Search quotations by number, customer or salesperson..."
		searchKeys={['quotationNo', 'customerName', 'salesPerson', 'transactionNo']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'quotationNo'}
				<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
					{value}
				</span>
			{:else if column.key === 'status'}
				<Badge
					status={value}
					label={value === 'quotation' ? 'Quotation' : value === 'sales' ? 'Converted to SO' : 'Completed'}
				/>
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View and print quotation"
				onEdit={() => openEdit(row)}
				editTitle="Edit quotation"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete quotation"
			/>
		</svelte:fragment>
	</DataTable>

	<QuotationFormModal bind:isOpen={isFormOpen} {quotationToEdit} />
	<QuotationDetailModal bind:isOpen={isDetailOpen} quotation={selectedQuotation} />
</div>
