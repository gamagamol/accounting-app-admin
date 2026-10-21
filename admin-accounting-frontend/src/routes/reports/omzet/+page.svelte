<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import OmzetReportView from '$lib/modules/reports/OmzetReportView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Omzet Report" description="Monthly gross sales, cost of goods sold and gross profit." />
	<OmzetReportView />
</div>
