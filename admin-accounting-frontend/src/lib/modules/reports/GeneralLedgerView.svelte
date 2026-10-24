<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { journalEntries, chartOfAccounts } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'date', label: 'Journal Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'reference', label: 'Reference No', sortable: true },
		{ key: 'description', label: 'Transaction Description', sortable: true },
		{ key: 'debitAccount', label: 'Debit Account', sortable: true },
		{ key: 'creditAccount', label: 'Credit Account', sortable: true },
		{ key: 'amount', label: 'Amount (IDR)', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];

	$: completedJournals = $journalEntries.filter((entry) => entry.status === 'completed');
	$: totalJournalAmount = completedJournals.reduce((s, j) => s + j.amount, 0);
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Total General Journal Movements</span>
			<p class="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono">{formatCurrency(totalJournalAmount)}</p>
		</div>
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Active Accounts (COA)</span>
			<p class="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">{$chartOfAccounts.length} Accounts</p>
		</div>
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Bookkeeping Balance</span>
			<p class="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-2">
				<span>Balanced</span>
				<span class="text-sm">⚖️</span>
			</p>
		</div>
	</div>

	<div class="flex justify-between items-center">
		<p class="text-xs text-gray-500 dark:text-slate-400">
			List of general journal entries recording financial and operational transactions.
		</p>
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print General Journal</Button>
	</div>

	<DataTable
		{columns}
		data={completedJournals}
		searchPlaceholder="Search journals by description, account, or reference number..."
		searchKeys={['description', 'reference', 'debitAccount', 'creditAccount']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'reference'}
				<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
					{value}
				</span>
			{:else if column.key === 'debitAccount'}
				<span class="font-medium text-emerald-800 dark:text-emerald-300">{value}</span>
			{:else if column.key === 'creditAccount'}
				<span class="font-medium text-rose-800 dark:text-rose-300">{value}</span>
			{:else}
				{column.format ? column.format(value, row) : value}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
