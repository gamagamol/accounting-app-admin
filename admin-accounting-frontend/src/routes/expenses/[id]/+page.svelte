<script lang="ts">
	import { page } from '$app/stores';
	import ExpenseDetailPage from '$lib/modules/budgeting/ExpenseDetailPage.svelte';

	$: expenseId = $page.params.id ?? '';
</script>

<ExpenseDetailPage {expenseId} />
