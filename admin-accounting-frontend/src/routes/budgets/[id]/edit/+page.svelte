<script lang="ts">
	import { page } from '$app/stores';
	import BudgetFormPage from '$lib/modules/budgeting/BudgetFormPage.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { annualBudgets } from '$lib/stores/dataStore';

	$: budgetId = $page.params.id ?? '';
	$: budget = $annualBudgets.find((item) => item.id === budgetId) ?? null;
</script>

{#if budget}
	<BudgetFormPage {budget} />
{:else}
	<TransactionPageShell
		title="Budget Not Found"
		description="The budget may have been deleted or the link is invalid."
		backHref="/budgets"
		backLabel="Back to annual budgets"
	>
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">No budget matches this ID.</p>
		</div>
	</TransactionPageShell>
{/if}
