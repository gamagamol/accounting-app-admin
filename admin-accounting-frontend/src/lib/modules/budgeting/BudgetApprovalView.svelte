<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import FilterSelect from '$lib/components/ui/FilterSelect.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import { annualBudgets } from '$lib/stores/dataStore';
	import { currencyColumn, dateColumn, statusColumn } from '$lib/utils/tableColumns';
	import type { AnnualBudget, TableColumn } from '$lib/types';

	let statusFilter = 'pending';

	const stageOptions = [
		{ value: 'pending', label: 'Pending' },
		{ value: 'approved', label: 'Approved' },
		{ value: 'rejected', label: 'Rejected' }
	];

	const columns: TableColumn[] = [
		{ key: 'budgetNo', label: 'Budget No', sortable: true },
		{ key: 'name', label: 'Budget Name', sortable: true },
		{ key: 'departmentName', label: 'Department', sortable: true },
		currencyColumn('totalAmount', 'Total Budget'),
		{ key: 'preparedBy', label: 'Prepared By' },
		dateColumn('createdAt', 'Submitted'),
		statusColumn()
	];

	$: statusCounts = $annualBudgets.reduce<Record<string, number>>((counts, budget) => {
		counts[budget.status] = (counts[budget.status] ?? 0) + 1;
		return counts;
	}, {});
	$: pendingCount = statusCounts.pending ?? 0;
	$: approvedCount = statusCounts.approved ?? 0;
	$: rejectedCount = statusCounts.rejected ?? 0;
	$: rows =
		statusFilter === 'all'
			? $annualBudgets
			: $annualBudgets.filter((budget) => budget.status === statusFilter);

	function openDetail(budget: AnnualBudget) {
		goto(`/budget-approval/${budget.id}`);
	}
</script>

<div class="space-y-6">
	<PageHeader
		title="Budget Approval"
		description="Review submitted annual budgets and approve or reject them before allocation."
	/>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<StatCard title="Pending Approval" value={String(pendingCount)} icon="⏳" color="yellow" hint="Waiting for a decision" />
		<StatCard title="Approved" value={String(approvedCount)} icon="✅" color="green" hint="Ready for allocation" />
		<StatCard title="Rejected" value={String(rejectedCount)} icon="⛔" color="red" hint="Returned to preparer" />
	</div>

	<DataTable
		columns={columns}
		data={rows}
		searchKeys={['budgetNo', 'name', 'departmentName', 'preparedBy', 'status']}
		searchPlaceholder="Search submitted budget..."
		emptyMessage="No budget in this approval stage"
	>
		<div slot="controls" class="flex items-center gap-2">
			<FilterSelect
				id="approval-status-filter"
				label="Stage"
				bind:value={statusFilter}
				allLabel="All"
				options={stageOptions}
			/>
		</div>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View budget"
				gap="normal"
			/>
		</svelte:fragment>
	</DataTable>
</div>
