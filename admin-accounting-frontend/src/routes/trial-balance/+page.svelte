<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import TrialBalanceView from '$lib/modules/reports/TrialBalanceView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Trial Balance" description="Debit and credit balances across the chart of accounts." />
	<TrialBalanceView />
</div>
