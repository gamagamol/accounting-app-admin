<script lang="ts">
	import { page } from '$app/stores';
	import ExpenseFormPage from '$lib/modules/budgeting/ExpenseFormPage.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { expenses } from '$lib/stores/dataStore';

	$: expenseId = $page.params.id ?? '';
	$: expense = $expenses.find((item) => item.id === expenseId) ?? null;
</script>

{#if expense}
	<ExpenseFormPage {expense} />
{:else}
	<TransactionPageShell
		title="Expense Not Found"
		description="The expense may have been deleted or the link is invalid."
		backHref="/expenses"
		backLabel="Back to expense entries"
	>
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">No expense matches this ID.</p>
		</div>
	</TransactionPageShell>
{/if}
