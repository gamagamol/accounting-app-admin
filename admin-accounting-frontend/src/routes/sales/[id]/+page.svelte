<script lang="ts">
	import { page } from '$app/stores';
	import SalesDetailPage from '$lib/modules/sales/SalesDetailPage.svelte';

	$: saleId = $page.params.id ?? '';
</script>

<SalesDetailPage {saleId} />
