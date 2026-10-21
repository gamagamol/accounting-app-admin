<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import PurchaseByVendorView from '$lib/modules/reports/PurchaseByVendorView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Purchase by Vendor" description="Purchase volume, invoicing and payables by vendor." />
	<PurchaseByVendorView />
</div>
