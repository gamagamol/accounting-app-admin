<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EntityFormPage from '$lib/components/transactions/EntityFormPage.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import {
		annualBudgets,
		budgetAllocations,
		chartOfAccounts,
		departments,
		hydrateBudgetingData
	} from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import {
		buildBudgetAllocationFields,
		budgetAllocationValues,
		mapBudgetAllocationToApi
	} from '$lib/modules/budgeting/budgetAllocationFields';

	$: allocationId = $page.params.id ?? '';
	$: allocation = $budgetAllocations.find((item) => item.id === allocationId) ?? null;
	$: fields = buildBudgetAllocationFields($annualBudgets, $chartOfAccounts, $departments);
	$: values = allocation ? budgetAllocationValues(allocation) : {};

	async function handleSubmit(payload: Record<string, any>) {
		if (!allocation) return;
		const preparedBy = Number($user?.id);
		const apiPayload = mapBudgetAllocationToApi(
			payload,
			$annualBudgets,
			$chartOfAccounts,
			$departments,
			Number.isSafeInteger(preparedBy) && preparedBy > 0 ? preparedBy : null
		);
		await budgetingApi.updateAllocation(allocation.id, apiPayload);
		await hydrateBudgetingData();
		goto(`/budget-allocation/${allocation.id}`);
	}
</script>

{#if allocation}
	<EntityFormPage
		title="Edit Budget Allocation"
		description="Update the allocation line. Every change is recorded in the audit trail."
		backHref={`/budget-allocation/${allocation.id}`}
		backLabel="Back to allocation details"
		eyebrow="Budgeting / Budget Allocation"
		documentNumber={`${allocation.budgetNo} / ${allocation.accountCode}`}
		fields={fields}
		values={values}
		submitLabel="Save Changes"
		onSubmit={handleSubmit}
		auditEntityType="budget_allocation"
		auditEntityId={allocation.id}
		auditRootTransactionId={allocation.rootTransactionId ?? ''}
	/>
{:else}
	<TransactionPageShell
		title="Budget Allocation Not Found"
		description="The allocation may have been deleted or the link is invalid."
		backHref="/budget-allocation"
		backLabel="Back to budget allocations"
	>
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">No budget allocation matches this ID.</p>
		</div>
	</TransactionPageShell>
{/if}
