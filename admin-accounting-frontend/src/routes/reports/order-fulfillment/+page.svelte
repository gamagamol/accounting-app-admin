<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import OrderFulfillmentView from '$lib/modules/reports/OrderFulfillmentView.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Order Fulfillment (SO vs DO)" description="Delivery fulfillment rate for every sales order." />
	<OrderFulfillmentView />
</div>
