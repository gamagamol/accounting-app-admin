<script lang="ts">
	import { page } from '$app/stores';
	import PurchaseDetailPage from '$lib/modules/purchase/PurchaseDetailPage.svelte';

	$: purchaseId = $page.params.id ?? '';
</script>

<PurchaseDetailPage {purchaseId} />
