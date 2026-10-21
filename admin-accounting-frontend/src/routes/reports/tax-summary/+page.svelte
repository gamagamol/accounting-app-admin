<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import TaxSummaryView from '$lib/modules/reports/TaxSummaryView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Tax Summary" description="Output and input VAT recap for the reporting period." />
	<TaxSummaryView />
</div>
