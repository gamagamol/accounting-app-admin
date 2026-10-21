<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FilterSelect from '$lib/components/ui/FilterSelect.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import BudgetFormModal from './BudgetFormModal.svelte';
	import BudgetDetailModal from './BudgetDetailModal.svelte';
	import {
		annualBudgets,
		budgetAllocations,
		budgetingActions
	} from '$lib/stores/dataStore';
	import { budgetingApi } from '$lib/api';
	import { budgetStatusOptions } from '$lib/data/accounting-options';
	import { formatSummaryCurrency } from '$lib/utils/formatters';
	import { currencyColumn, statusColumn } from '$lib/utils/tableColumns';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { AnnualBudget, TableColumn } from '$lib/types';

	let isFormOpen = false;
	let editingBudget: AnnualBudget | null = null;
	let isDetailOpen = false;
	let detailBudget: AnnualBudget | null = null;
	let statusFilter = 'all';

	const columns: TableColumn[] = [
		{ key: 'budgetNo', label: 'Budget No', sortable: true },
		{ key: 'name', label: 'Budget Name', sortable: true },
		{ key: 'departmentName', label: 'Department', sortable: true },
		{ key: 'fiscalYear', label: 'Year', sortable: true, align: 'center' },
		currencyColumn('totalAmount', 'Total Budget'),
		statusColumn(),
		{ key: 'preparedBy', label: 'Prepared By' }
	];

	$: totalBudget = $annualBudgets.reduce((sum, budget) => sum + budget.totalAmount, 0);
	$: allocated = $budgetAllocations.reduce((sum, line) => sum + line.allocatedAmount, 0);
	$: used = $budgetAllocations.reduce((sum, line) => sum + line.usedAmount, 0);
	$: pending = $annualBudgets.filter((budget) => budget.status === 'submitted').length;
	$: filteredBudgets =
		statusFilter === 'all'
			? $annualBudgets
			: $annualBudgets.filter((budget) => budget.status === statusFilter);

	function openCreate() {
		editingBudget = null;
		isFormOpen = true;
	}

	function openEdit(budget: AnnualBudget) {
		editingBudget = budget;
		isFormOpen = true;
	}

	function openDetail(budget: AnnualBudget) {
		detailBudget = budget;
		isDetailOpen = true;
	}

	async function deleteBudget(budget: AnnualBudget) {
		if (!confirm(`Delete budget "${budget.name}"? Its allocations and revisions will also be removed.`)) {
			return;
		}
		try {
			await budgetingApi.deleteBudget(budget.id);
			budgetingActions.deleteBudget(budget.id);
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to delete budget.'));
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Annual Budget Plan"
			description="Prepare annual budget headers per department before allocation and approval."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			New Budget
		</Button>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
		<StatCard title="Total Budget" value={formatSummaryCurrency(totalBudget)} icon="🎯" color="blue" hint="All annual budget headers" />
		<StatCard title="Allocated" value={formatSummaryCurrency(allocated)} icon="🧩" color="purple" hint="Allocated to COA & department" />
		<StatCard title="Used" value={formatSummaryCurrency(used)} icon="📉" color="yellow" hint="Consumed by actual expenses" />
		<StatCard title="Pending Approval" value={String(pending)} icon="⏳" color="red" hint="Submitted budget plans" />
	</div>

	<DataTable
		columns={columns}
		data={filteredBudgets}
		searchKeys={['budgetNo', 'name', 'departmentName', 'preparedBy', 'status']}
		searchPlaceholder="Search budget number, name or department..."
		emptyMessage="No budget plans found"
	>
		<div slot="controls" class="flex items-center gap-2">
			<FilterSelect
				id="budget-status-filter"
				label="Status"
				bind:value={statusFilter}
				allLabel="All"
				options={budgetStatusOptions}
			/>
		</div>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				onEdit={() => openEdit(row)}
				onDelete={() => deleteBudget(row)}
				viewTitle="View budget"
				editTitle="Edit budget"
				deleteTitle="Delete budget"
			/>
		</svelte:fragment>
	</DataTable>
</div>

<BudgetFormModal bind:isOpen={isFormOpen} budget={editingBudget} />
<BudgetDetailModal bind:isOpen={isDetailOpen} budget={detailBudget} />
