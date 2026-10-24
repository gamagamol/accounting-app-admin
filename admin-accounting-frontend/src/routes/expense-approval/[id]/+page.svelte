<script lang="ts">
	import { page } from '$app/stores';
	import ExpenseApprovalDetailPage from '$lib/modules/budgeting/ExpenseApprovalDetailPage.svelte';

	$: expenseId = $page.params.id ?? '';
</script>

<ExpenseApprovalDetailPage {expenseId} />
