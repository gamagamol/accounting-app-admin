<script lang="ts">
	import { page } from '$app/stores';
	import PostedExpenseDetailPage from '$lib/modules/budgeting/PostedExpenseDetailPage.svelte';

	$: expenseId = $page.params.id ?? '';
</script>

<PostedExpenseDetailPage {expenseId} />
