<script lang="ts">
	import { page } from '$app/stores';
	import QuotationDetailPage from '$lib/modules/quotation/QuotationDetailPage.svelte';

	$: quotationId = $page.params.id ?? '';
</script>

<QuotationDetailPage {quotationId} />
