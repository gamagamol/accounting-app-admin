<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import FilterSelect from '$lib/components/ui/FilterSelect.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import ApprovalActions from '$lib/components/ui/ApprovalActions.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import BudgetDetailModal from './BudgetDetailModal.svelte';
	import { annualBudgets, budgetingActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import { currencyColumn, dateColumn, statusColumn } from '$lib/utils/tableColumns';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { AnnualBudget, TableColumn } from '$lib/types';

	let statusFilter = 'submitted';
	let isDetailOpen = false;
	let detailBudget: AnnualBudget | null = null;
	let workingId = '';

	const stageOptions = [
		{ value: 'submitted', label: 'Pending' },
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
	$: pendingCount = statusCounts.submitted ?? 0;
	$: approvedCount = statusCounts.approved ?? 0;
	$: rejectedCount = statusCounts.rejected ?? 0;
	$: rows =
		statusFilter === 'all'
			? $annualBudgets
			: $annualBudgets.filter((budget) => budget.status === statusFilter);

	function openDetail(budget: AnnualBudget) {
		detailBudget = budget;
		isDetailOpen = true;
	}

	async function decide(budget: AnnualBudget, decision: 'approve' | 'reject') {
		workingId = budget.id;
		try {
			if (decision === 'approve') {
				await budgetingApi.approveBudget(budget.id, { approvedBy: $user?.name });
				budgetingActions.approveBudget(budget.id, $user?.name);
			} else {
				await budgetingApi.rejectBudget(budget.id, { approvedBy: $user?.name });
				budgetingActions.rejectBudget(budget.id);
			}
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to update budget status.'));
		} finally {
			workingId = '';
		}
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
			>
				{#if row.status === 'submitted'}
					<ApprovalActions
						disabled={workingId === row.id}
						onApprove={() => decide(row, 'approve')}
						onReject={() => decide(row, 'reject')}
					/>
				{/if}
			</RowActions>
		</svelte:fragment>
	</DataTable>
</div>

<BudgetDetailModal bind:isOpen={isDetailOpen} budget={detailBudget} />
