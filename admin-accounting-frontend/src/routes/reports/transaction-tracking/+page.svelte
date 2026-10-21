<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import TransactionTrackingView from '$lib/modules/reports/TransactionTrackingView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Transaction Tracking" description="End-to-end lifecycle tracking from quotation to settlement." />
	<TransactionTrackingView />
</div>
