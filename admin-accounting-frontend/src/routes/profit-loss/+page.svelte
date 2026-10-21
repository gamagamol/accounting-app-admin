<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import ProfitLossView from '$lib/modules/reports/ProfitLossView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Profit & Loss" description="Revenue, cost of goods sold, operating expenses and net profit." />
	<ProfitLossView />
</div>
