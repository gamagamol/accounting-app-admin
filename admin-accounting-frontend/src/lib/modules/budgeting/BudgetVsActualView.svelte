<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import FilterSelect from '$lib/components/ui/FilterSelect.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import {
		annualBudgets,
		budgetAllocations,
		departments,
		expenses
	} from '$lib/stores/dataStore';
	import { formatCurrency, formatSummaryCurrency } from '$lib/utils/formatters';
	import { currencyColumn, percentColumn } from '$lib/utils/tableColumns';
	import type { BudgetAllocation, ExpenseEntry, TableColumn } from '$lib/types';

	interface BudgetActualRow extends BudgetAllocation {
		budgetName: string;
		actualAmount: number;
		variance: number;
		utilization: number;
	}

	let departmentFilter = 'all';

	const columns: TableColumn[] = [
		{
			key: 'budgetNo',
			label: 'Budget',
			sortable: true,
			format: (value, row) => `${value} — ${row.budgetName}`
		},
		{
			key: 'accountCode',
			label: 'Account (COA)',
			sortable: true,
			format: (value, row) => `${value} — ${row.accountName}`
		},
		{ key: 'departmentName', label: 'Department', sortable: true },
		currencyColumn('allocatedAmount', 'Budget'),
		currencyColumn('actualAmount', 'Actual'),
		{
			key: 'variance',
			label: 'Variance',
			sortable: true,
			align: 'right',
			format: (value) => {
				const amount = Number(value) || 0;
				return `${amount < 0 ? '-' : ''}${formatCurrency(Math.abs(amount))}`;
			}
		},
		percentColumn('utilization', 'Used %')
	];

	$: departmentOptions = $departments.map((department) => ({
		value: department.code,
		label: department.name
	}));

	$: budgetNameById = new Map($annualBudgets.map((budget) => [budget.id, budget.name]));
	$: approvedExpensesByBudget = $expenses
		.filter((expense) => expense.status === 'approved' || expense.status === 'posted')
		.reduce<Record<string, ExpenseEntry[]>>((groups, expense) => {
			const group = groups[expense.budgetId] ?? [];
			group.push(expense);
			groups[expense.budgetId] = group;
			return groups;
		}, {});
	$: baseRows = $budgetAllocations.map((allocation) => {
		const actualAmount = (approvedExpensesByBudget[allocation.budgetId] ?? [])
			.filter((expense) => expense.accountCode.startsWith(allocation.accountCode))
			.reduce((sum, expense) => sum + expense.totalAmount, 0);

		return {
			...allocation,
			budgetName: budgetNameById.get(allocation.budgetId) ?? allocation.budgetNo,
			actualAmount,
			variance: allocation.allocatedAmount - actualAmount,
			utilization:
				allocation.allocatedAmount > 0 ? (actualAmount / allocation.allocatedAmount) * 100 : 0
		} satisfies BudgetActualRow;
	});

	$: rows =
		departmentFilter === 'all'
			? baseRows
			: baseRows.filter((row) => row.departmentCode === departmentFilter);

	$: totalBudget = rows.reduce((sum, row) => sum + row.allocatedAmount, 0);
	$: totalActual = rows.reduce((sum, row) => sum + row.actualAmount, 0);
	$: totalVariance = totalBudget - totalActual;
	$: overBudget = rows.filter((row) => row.variance < 0).length;
</script>

<div class="space-y-6">
	<PageHeader
		title="Budget vs Actual"
		description="Compare approved budget allocation with actual approved and posted expenses per COA and department."
	/>

	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
		<StatCard title="Total Budget" value={formatSummaryCurrency(totalBudget)} icon="🎯" color="blue" hint="Allocation for current filter" />
		<StatCard title="Actual Expense" value={formatSummaryCurrency(totalActual)} icon="🧾" color="yellow" hint="Approved + posted expenses" />
		<StatCard title="Remaining" value={formatSummaryCurrency(totalVariance)} icon="💼" color="green" hint="Budget minus actual" />
		<StatCard title="Over Budget Lines" value={String(overBudget)} icon="⚠️" color="red" hint="Variance below zero" />
	</div>

	<div class="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-3 text-xs text-blue-800 dark:text-blue-200">
		<strong>API:</strong> GET /api/budgeting/budget-vs-actual — the backend will recalculate actual
		amounts from posted journals. This page uses approved/posted expense entries as the local mock
		source.
	</div>

	<DataTable
		columns={columns}
		data={rows}
		searchKeys={['budgetNo', 'accountCode', 'accountName', 'departmentName']}
		searchPlaceholder="Search budget, COA or department..."
		emptyMessage="No budget allocation found for this filter"
	>
		<div slot="controls" class="flex items-center gap-2">
			<FilterSelect
				id="budget-dept-filter"
				label="Department"
				bind:value={departmentFilter}
				allLabel="All departments"
				options={departmentOptions}
			/>
		</div>

		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'variance'}
				<span class="font-semibold {Number(value) < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}">
					{column.format?.(value, row)}
				</span>
			{:else if column.key === 'utilization'}
				<div class="flex items-center justify-end gap-2">
					{#if row.variance < 0}
						<Badge status="over_budget" label="Over" />
					{/if}
					<span class="font-semibold {row.variance < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-gray-800 dark:text-gray-200'}">
						{column.format?.(value, row)}
					</span>
				</div>
			{:else if column.format}
				{column.format(value, row)}
			{:else}
				{value ?? '-'}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
