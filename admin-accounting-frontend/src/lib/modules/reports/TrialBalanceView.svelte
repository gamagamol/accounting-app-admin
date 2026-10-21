<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { chartOfAccounts } from '$lib/stores/dataStore';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	interface TrialBalanceRow {
		code: string;
		name: string;
		category: string;
		debit: number;
		credit: number;
	}

	const debitCategories = ['Asset', 'Expense'];
	const creditCategories = ['Liability', 'Equity', 'Revenue'];

	$: rows = $chartOfAccounts.map((acc) => {
		const isDebit = debitCategories.includes(acc.category);
		return {
			code: acc.code,
			name: acc.name,
			category: acc.category,
			debit: isDebit && acc.balance >= 0 ? acc.balance : 0,
			credit: !isDebit && acc.balance >= 0 ? acc.balance : 0
		};
	});

	$: totalDebit = rows.reduce((s, r) => s + r.debit, 0);
	$: totalCredit = rows.reduce((s, r) => s + r.credit, 0);
	$: difference = totalDebit - totalCredit;

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Account Code', sortable: true },
		{ key: 'name', label: 'Account Name', sortable: true },
		{ key: 'category', label: 'Category', sortable: true },
		{ key: 'debit', label: 'Debit (IDR)', align: 'right', sortable: true, format: (v) => (v > 0 ? formatCurrency(v) : '-') },
		{ key: 'credit', label: 'Credit (IDR)', align: 'right', sortable: true, format: (v) => (v > 0 ? formatCurrency(v) : '-') }
	];
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Total Debit</span>
			<p class="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">{formatCurrency(totalDebit)}</p>
		</div>
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Total Credit</span>
			<p class="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1 font-mono">{formatCurrency(totalCredit)}</p>
		</div>
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Balance Status</span>
			<p class="text-xl font-bold {difference === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'} mt-1 flex items-center gap-2">
				<span>{difference === 0 ? 'Balanced' : 'Out of Balance'}</span>
				<span class="text-sm">{difference === 0 ? '⚖️' : '⚠️'}</span>
			</p>
		</div>
	</div>

	<div class="flex justify-between items-center gap-3 flex-wrap">
		<p class="text-xs text-gray-500 dark:text-slate-400">
			Trial balance as of the current period. Debit and credit totals must be equal.
		</p>
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Trial Balance</Button>
	</div>

	<DataTable {columns} data={rows} searchPlaceholder="Search account code or name..." searchKeys={['code', 'name', 'category']}>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'code'}
				<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
					{value}
				</span>
			{:else}
				{column.format ? column.format(value, row) : value}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
