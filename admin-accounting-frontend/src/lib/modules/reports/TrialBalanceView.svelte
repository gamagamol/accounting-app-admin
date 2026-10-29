<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'account_code', label: 'Account Code', sortable: true },
		{ key: 'account_name', label: 'Account Name', sortable: true },
		{ key: 'account_type', label: 'Type', align: 'center', sortable: true },
		{ key: 'total_debit', label: 'Debit', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'total_credit', label: 'Credit', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'balance', label: 'Balance', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];

	const summary = (rows: Record<string, any>[]) => {
		const debit = sumBy(rows, 'total_debit');
		const credit = sumBy(rows, 'total_credit');
		return [
			{ label: 'Total Debit', value: formatCurrency(debit), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Total Credit', value: formatCurrency(credit), tone: 'text-indigo-700 dark:text-indigo-400' },
			{ label: 'Difference', value: formatCurrency(debit - credit), tone: Math.abs(debit - credit) < 0.01 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400' },
			{ label: 'Accounts', value: String(rows.length), tone: 'text-gray-900 dark:text-white' }
		];
	};
</script>

<LiveReport
	slug="trial-balance"
	{columns}
	{summary}
	fiscalYearMode
	autoRefreshMs={30000}
	searchPlaceholder="Search account..."
	searchKeys={['account_code', 'account_name', 'account_type']}
	emptyMessage="No chart of accounts found."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'account_code'}
			<span class="font-mono font-bold text-gray-900 dark:text-gray-100">{value}</span>
		{:else if column.key === 'balance'}
			<span class="font-mono font-bold {Number(value) >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}">
				{formatCurrency(value)}
			</span>
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
