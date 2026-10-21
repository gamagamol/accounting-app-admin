<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import QuotationDetailView from '$lib/modules/reports/QuotationDetailView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Quotation Detail" description="Line-item breakdown of all issued quotations." />
	<QuotationDetailView />
</div>
