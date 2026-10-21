<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import StockCardView from '$lib/modules/reports/StockCardView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Stock Card" description="Chronological inventory movement and running balance per product." />
	<StockCardView />
</div>
