<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import QuotationVsPoView from '$lib/modules/reports/QuotationVsPoView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Quotation vs PO" description="Conversion of issued quotations into confirmed sales orders." />
	<QuotationVsPoView />
</div>
