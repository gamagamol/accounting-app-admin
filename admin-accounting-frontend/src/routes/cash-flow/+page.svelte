<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import CashFlowView from '$lib/modules/reports/CashFlowView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Cash Flow Statement" description="Cash inflows and outflows from operating activities." />
	<CashFlowView />
</div>
