<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import BalanceSheetView from '$lib/modules/reports/BalanceSheetView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Balance Sheet" description="Financial position: assets, liabilities and equity." />
	<BalanceSheetView />
</div>
