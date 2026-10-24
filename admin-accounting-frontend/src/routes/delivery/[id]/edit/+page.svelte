<script lang="ts">
	import { page } from '$app/stores';
	import DeliveryFormPage from '$lib/modules/delivery/DeliveryFormPage.svelte';
	import { deliveries } from '$lib/stores/dataStore';

	$: deliveryId = $page.params.id ?? '';
	$: delivery = $deliveries.find((item) => item.id === deliveryId) ?? null;
</script>

{#if delivery}
	<DeliveryFormPage {delivery} />
{:else}
	<p class="text-sm text-gray-500 dark:text-slate-400">Delivery order not found.</p>
{/if}
