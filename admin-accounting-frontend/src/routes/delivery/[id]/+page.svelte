<script lang="ts">
	import { page } from '$app/stores';
	import DeliveryDetailPage from '$lib/modules/delivery/DeliveryDetailPage.svelte';

	$: deliveryId = $page.params.id ?? '';
</script>

<DeliveryDetailPage {deliveryId} />
