<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { quotations, quotationActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { Quotation, TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'quotationNo', label: 'Quotation No', sortable: true },
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'salesPerson', label: 'Salesperson' },
		{ key: 'total', label: 'Total Amount', sortable: true, align: 'right', format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	function openCreate() {
		goto('/quotation/new');
	}

	function openEdit(item: Quotation) {
		goto(`/quotation/${item.id}/edit`);
	}

	function openDetail(item: Quotation) {
		goto(`/quotation/${item.id}`);
	}

	function handleDelete(item: Quotation) {
		if (!confirm(`Delete quotation ${item.quotationNo}? This action cannot be undone.`)) return;
		auditLogActions.record({
			module: 'sales',
			entityType: 'quotation',
			entityId: item.id,
			documentNumber: item.quotationNo,
			action: 'delete',
			actor: $user?.name || 'Sales Admin',
			summary: `Deleted quotation ${item.quotationNo}.`,
			before: item as unknown as Record<string, unknown>
		});
		quotationActions.delete(item.id);
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
				<Badge status={value} />
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
</div>
