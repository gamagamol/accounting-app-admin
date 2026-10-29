<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'date', label: 'Journal Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'journal_number', label: 'Reference No', sortable: true },
		{ key: 'account_code', label: 'Account Code', sortable: true },
		{ key: 'account_name', label: 'Account Name', sortable: true },
		{ key: 'description', label: 'Description', sortable: true },
		{ key: 'debit', label: 'Debit', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'credit', label: 'Credit', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'balance', label: 'Balance', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'reference_type', label: 'Source', align: 'center' }
	];

	const summary = (rows: Record<string, any>[]) => {
		const accounts = new Set(rows.map((row) => row.account_code));
		return [
			{ label: 'Total Debit', value: formatCurrency(sumBy(rows, 'debit')), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Total Credit', value: formatCurrency(sumBy(rows, 'credit')), tone: 'text-indigo-700 dark:text-indigo-400' },
			{ label: 'Journal Lines', value: String(rows.length), tone: 'text-gray-900 dark:text-white' },
			{ label: 'Accounts Touched', value: String(accounts.size), tone: 'text-emerald-700 dark:text-emerald-400' }
		];
	};
</script>

<LiveReport
	slug="general-ledger"
	{columns}
	{summary}
	fiscalYearMode
	autoRefreshMs={30000}
	searchPlaceholder="Search reference, account, or description..."
	searchKeys={['journal_number', 'account_code', 'account_name', 'description', 'reference_type']}
	emptyMessage="No posted journal entries yet."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'journal_number'}
			<span class="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
				{value}
			</span>
		{:else if column.key === 'balance'}
			<span class="font-mono font-bold {Number(value) >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}">
				{formatCurrency(value)}
			</span>
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
