<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import CustomerOmzetView from '$lib/modules/reports/CustomerOmzetView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Customer Omzet" description="Revenue contribution and order volume by customer." />
	<CustomerOmzetView />
</div>
