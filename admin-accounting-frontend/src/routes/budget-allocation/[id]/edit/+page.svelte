<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EntityFormPage from '$lib/components/transactions/EntityFormPage.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
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
	import {
		buildBudgetAllocationFields,
		buildBudgetAllocationPayload,
		budgetAllocationValues
	} from '$lib/modules/budgeting/budgetAllocationFields';

	$: allocationId = $page.params.id ?? '';
	$: allocation = $budgetAllocations.find((item) => item.id === allocationId) ?? null;
	$: fields = buildBudgetAllocationFields($annualBudgets, $chartOfAccounts, $departments);
	$: values = allocation ? budgetAllocationValues(allocation) : {};

	async function handleSubmit(payload: Record<string, any>) {
		if (!allocation) return;
		const before = allocation as unknown as Record<string, unknown>;
		const fullPayload = buildBudgetAllocationPayload(payload, $annualBudgets, $chartOfAccounts, $departments);
		await budgetingApi.updateAllocation(allocation.id, fullPayload);
		budgetingActions.updateAllocation(allocation.id, fullPayload);
		const after = { ...allocation, ...fullPayload } as unknown as Record<string, unknown>;
		auditLogActions.record({
			module: 'budgeting',
			entityType: 'budget_allocation',
			entityId: allocation.id,
			documentNumber: `${fullPayload.budgetNo} / ${fullPayload.accountCode}`,
			action: 'update',
			actor: $user?.name || 'Budget Owner',
			summary: `Updated budget allocation for ${fullPayload.accountCode} on ${fullPayload.budgetNo}.`,
			before,
			after
		});
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
