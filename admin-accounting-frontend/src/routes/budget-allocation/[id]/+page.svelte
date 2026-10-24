<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import EntityDetailPage from '$lib/components/transactions/EntityDetailPage.svelte';
	import {
		annualBudgets,
		budgetAllocations,
		chartOfAccounts,
		departments
	} from '$lib/stores/dataStore';
	import { buildBudgetAllocationFields } from '$lib/modules/budgeting/budgetAllocationFields';

	$: allocationId = $page.params.id ?? '';
	$: allocation = $budgetAllocations.find((item) => item.id === allocationId) ?? null;
	$: fields = buildBudgetAllocationFields($annualBudgets, $chartOfAccounts, $departments);
</script>

<EntityDetailPage
	title="Budget Allocation Details"
	description="Review the allocation line and its audit trail."
	backHref="/budget-allocation"
	backLabel="Back to budget allocations"
	eyebrow="Budgeting / Budget Allocation"
	documentNumber={allocation?.budgetNo ?? ''}
	fields={fields}
	row={allocation}
	auditEntityType="budget_allocation"
	auditEntityId={allocation?.id ?? ''}
>
	<svelte:fragment slot="actions">
		{#if allocation}
			<Button variant="secondary" href={`/budget-allocation/${allocation.id}/edit`}>Edit</Button>
		{/if}
	</svelte:fragment>
</EntityDetailPage>
