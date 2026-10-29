<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import CoaFormModal from './CoaFormModal.svelte';
	import CoaDetailModal from './CoaDetailModal.svelte';
	import { chartOfAccounts, coaActions } from '$lib/stores/dataStore';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { ChartOfAccount, TableColumn } from '$lib/types';

	let isFormOpen = false;
	let isDetailOpen = false;
	let selectedAccount: ChartOfAccount | null = null;
	let coaToEdit: ChartOfAccount | null = null;

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Account Code', sortable: true },
		{ key: 'name', label: 'Account Name', sortable: true },
		{ key: 'category', label: 'Category', sortable: true },
		{
			key: 'balance',
			label: 'Balance (IDR)',
			sortable: true,
			align: 'right',
			format: (v) => formatCurrency(Number(v) || 0)
		}
	];

	function openCreate() {
		coaToEdit = null;
		isFormOpen = true;
	}

	function openEdit(coa: ChartOfAccount) {
		coaToEdit = coa;
		isFormOpen = true;
	}

	function openDetail(coa: ChartOfAccount) {
		selectedAccount = coa;
		isDetailOpen = true;
	}

	async function handleDelete(coa: ChartOfAccount) {
		if (confirm(`Delete account ${coa.code} - ${coa.name}? This action cannot be undone.`)) {
			try {
				await coaActions.delete(coa.id);
			} catch (error) {
				alert(error instanceof Error ? error.message : 'Failed to delete account.');
			}
		}
	}

	function getCategoryColor(cat: string) {
		switch (cat) {
			case 'Asset':
				return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/20';
			case 'Liability':
				return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/20';
			case 'Equity':
				return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-200 dark:border-purple-500/20';
			case 'Revenue':
				return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/20';
			case 'Expense':
				return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20';
			default:
				return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Chart of Accounts"
			description="Accounting ledger structure: assets, liabilities, equity, revenue and expenses."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>Add Account</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$chartOfAccounts}
		searchPlaceholder="Search by account code or account name..."
		searchKeys={['code', 'name', 'category']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'code'}
				<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
					{value}
				</span>
			{:else if column.key === 'category'}
				<span class="px-2 py-0.5 rounded-full text-xs font-semibold border {getCategoryColor(value)}">
					{value}
				</span>
			{:else if column.key === 'balance'}
				<span class="font-mono font-semibold text-gray-900 dark:text-gray-100">
					{formatCurrency(Number(value) || 0)}
				</span>
			{:else}
				{value ?? '-'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View account details"
				onEdit={() => openEdit(row)}
				editTitle="Edit account"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete account"
			/>
		</svelte:fragment>
	</DataTable>

	<CoaFormModal bind:isOpen={isFormOpen} {coaToEdit} />
	<CoaDetailModal bind:isOpen={isDetailOpen} account={selectedAccount} />
</div>
