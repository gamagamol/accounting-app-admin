<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import GrossProfitByProductView from '$lib/modules/reports/GrossProfitByProductView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Gross Profit by Product" description="Revenue, cost of goods sold and margin per product." />
	<GrossProfitByProductView />
</div>
