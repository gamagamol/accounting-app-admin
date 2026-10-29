<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import LiveReport from '$lib/live/LiveReport.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const transform = (rows: Record<string, any>[]) =>
		rows.map((row) => {
			const allocated = Number(row.allocated_amount ?? 0);
			const actual = Number(row.actual_amount ?? 0);
			return {
				...row,
				utilization: allocated > 0 ? Math.round((actual / allocated) * 1000) / 10 : 0
			};
		});

	const columns: TableColumn[] = [
		{ key: 'budget_number', label: 'Budget No', sortable: true },
		{ key: 'fiscal_year', label: 'Year', align: 'center', sortable: true },
		{ key: 'department_name', label: 'Department', sortable: true },
		{ key: 'account_code', label: 'Account Code', sortable: true },
		{ key: 'account_name', label: 'Account Name', sortable: true },
		{ key: 'allocated_amount', label: 'Budget', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'actual_amount', label: 'Actual', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'remaining_amount', label: 'Remaining', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'utilization', label: 'Used %', align: 'center', sortable: true, format: (v) => `${v}%` }
	];

	const summary = (rows: Record<string, any>[]) => {
		const budget = sumBy(rows, 'allocated_amount');
		const actual = sumBy(rows, 'actual_amount');
		return [
			{ label: 'Total Budget', value: formatCurrency(budget), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Actual Expense', value: formatCurrency(actual), tone: 'text-amber-700 dark:text-amber-400' },
			{ label: 'Remaining', value: formatCurrency(budget - actual), tone: budget - actual >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400' },
			{ label: 'Over Budget Lines', value: String(rows.filter((row) => Number(row.remaining_amount ?? 0) < 0).length), tone: 'text-rose-700 dark:text-rose-400' }
		];
	};
</script>

<div class="space-y-6">
	<PageHeader
		title="Budget vs Actual"
		description="Compare approved budget allocation with actual posted expenses per COA and department."
	/>

	<LiveReport
		slug="budget-vs-actual"
		{columns}
		{summary}
		{transform}
		searchPlaceholder="Search budget, COA, or department..."
		searchKeys={['budget_number', 'account_code', 'account_name', 'department_name']}
		emptyMessage="No budget allocation found."
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'remaining_amount'}
				<span class="font-mono font-bold {Number(value) < 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}">
					{formatCurrency(value)}
				</span>
			{:else if column.key === 'utilization'}
				<span class="rounded-full px-2 py-0.5 text-xs font-semibold {Number(value) > 100 ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : Number(value) >= 80 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'}">
					{value}%
				</span>
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>
	</LiveReport>
</div>
