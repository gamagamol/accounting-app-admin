<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import AgingScheduleView from '$lib/modules/reports/AgingScheduleView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Aging Schedule" description="Accounts receivable aging by customer and due-date bucket." />
	<AgingScheduleView />
</div>
