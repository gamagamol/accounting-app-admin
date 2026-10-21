<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DashboardMetrics from '$lib/modules/dashboard/DashboardMetrics.svelte';
	import TransactionFunnel from '$lib/modules/dashboard/TransactionFunnel.svelte';
	import RecentActivities from '$lib/modules/dashboard/RecentActivities.svelte';
</script>

<div class="space-y-6">
	<PageHeader
		title="Dashboard"
		description="Overview of accounting operations, receivables, vendor payables and transaction flow."
	/>
	<DashboardMetrics />
	<TransactionFunnel />
	<RecentActivities />
</div>
