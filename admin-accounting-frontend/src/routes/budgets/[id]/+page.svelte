<script lang="ts">
	import { page } from '$app/stores';
	import BudgetDetailPage from '$lib/modules/budgeting/BudgetDetailPage.svelte';

	$: budgetId = $page.params.id ?? '';
</script>

<BudgetDetailPage {budgetId} />
