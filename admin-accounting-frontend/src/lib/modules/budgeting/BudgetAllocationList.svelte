<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import {
		annualBudgets,
		budgetAllocations,
		budgetingActions,
		chartOfAccounts,
		departments,
		auditLogActions
	} from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import { buildBudgetAllocationFields } from '$lib/modules/budgeting/budgetAllocationFields';
	import { formatCurrency } from '$lib/utils/formatters';
	import { currencyColumn } from '$lib/utils/tableColumns';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'budgetNo', label: 'Budget No', sortable: true },
		{
			key: 'account',
			label: 'Account (COA)',
			format: (_value, row) => `${row.accountCode} — ${row.accountName}`
		},
		{ key: 'departmentName', label: 'Department', sortable: true },
		currencyColumn('allocatedAmount', 'Allocated'),
		currencyColumn('usedAmount', 'Used'),
		{
			key: 'remaining',
			label: 'Remaining',
			align: 'right',
			format: (_value, row) => formatCurrency((row.allocatedAmount || 0) - (row.usedAmount || 0))
		}
	];

	$: fields = buildBudgetAllocationFields($annualBudgets, $chartOfAccounts, $departments);

	async function deleteAllocation(id: string) {
		const item = $budgetAllocations.find((allocation) => allocation.id === id);
		if (!item) return;
		if (!confirm(`Delete allocation for ${item.accountCode}? This action cannot be undone.`)) return;
		try {
			await budgetingApi.deleteAllocation(id);
			auditLogActions.record({
				module: 'budgeting',
				entityType: 'budget_allocation',
				entityId: item.id,
				documentNumber: `${item.budgetNo} / ${item.accountCode}`,
				action: 'delete',
				actor: $user?.name || 'Budget Owner',
				summary: `Deleted budget allocation ${item.accountCode} on ${item.budgetNo}.`,
				before: item as unknown as Record<string, unknown>
			});
			budgetingActions.deleteAllocation(id);
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to delete budget allocation.'));
		}
	}
</script>

<EntityManager
	title="Budget Allocation"
	description="Allocate annual budget to expense accounts and departments. Each line is the basis for budget vs actual control."
	entityName="budget allocation"
	createLabel="Add Allocation"
	columns={columns}
	data={$budgetAllocations}
	fields={fields}
	searchKeys={['budgetNo', 'accountCode', 'accountName', 'departmentName', 'notes']}
	searchPlaceholder="Search budget, COA or department..."
	displayKey="budgetNo"
	formSize="2xl"
	createHref="/budget-allocation/new"
	viewHref={(row) => `/budget-allocation/${row.id}`}
	editHref={(row) => `/budget-allocation/${row.id}/edit`}
	onDelete={deleteAllocation}
/>
