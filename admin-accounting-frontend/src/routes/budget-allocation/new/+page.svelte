<script lang="ts">
	import { goto } from '$app/navigation';
	import EntityFormPage from '$lib/components/transactions/EntityFormPage.svelte';
	import {
		annualBudgets,
		budgetingActions,
		chartOfAccounts,
		departments,
		auditLogActions
	} from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import {
		buildBudgetAllocationFields,
		buildBudgetAllocationPayload
	} from '$lib/modules/budgeting/budgetAllocationFields';

	$: fields = buildBudgetAllocationFields($annualBudgets, $chartOfAccounts, $departments);
	$: firstAccount = $chartOfAccounts.find((account) => account.category === 'Expense');
	$: initialValues = {
		budgetNo: $annualBudgets[0]?.budgetNo ?? '',
		accountCode: firstAccount?.code ?? '',
		departmentCode: $departments[0]?.code ?? '',
		allocatedAmount: 0,
		usedAmount: 0,
		notes: ''
	};

	async function handleSubmit(payload: Record<string, any>) {
		const fullPayload = buildBudgetAllocationPayload(payload, $annualBudgets, $chartOfAccounts, $departments);
		await budgetingApi.createAllocation(fullPayload);
		const created = budgetingActions.addAllocation(fullPayload);
		auditLogActions.record({
			module: 'budgeting',
			entityType: 'budget_allocation',
			entityId: created.id,
			documentNumber: `${created.budgetNo} / ${created.accountCode}`,
			action: 'create',
			actor: $user?.name || 'Budget Owner',
			summary: `Created budget allocation for ${created.accountCode} on ${created.budgetNo}.`,
			after: created as unknown as Record<string, unknown>
		});
		goto(`/budget-allocation/${created.id}`);
	}
</script>

<EntityFormPage
	title="Add Budget Allocation"
	description="Allocate an annual budget to an expense account and department on a dedicated page."
	backHref="/budget-allocation"
	backLabel="Back to budget allocations"
	eyebrow="Budgeting / Budget Allocation"
	documentNumber="New allocation"
	fields={fields}
	values={initialValues}
	submitLabel="Create Allocation"
	onSubmit={handleSubmit}
/>
