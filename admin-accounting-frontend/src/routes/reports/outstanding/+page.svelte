<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import OutstandingView from '$lib/modules/reports/OutstandingView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Outstanding Report" description="Outstanding receivables, pending deliveries and pending purchase orders." />
	<OutstandingView />
</div>
