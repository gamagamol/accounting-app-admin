<script lang="ts">
	import { page } from '$app/stores';
	import BudgetApprovalDetailPage from '$lib/modules/budgeting/BudgetApprovalDetailPage.svelte';

	$: budgetId = $page.params.id ?? '';
</script>

<BudgetApprovalDetailPage {budgetId} />
