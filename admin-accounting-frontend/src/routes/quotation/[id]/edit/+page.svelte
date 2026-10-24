<script lang="ts">
	import { page } from '$app/stores';
	import QuotationFormPage from '$lib/modules/quotation/QuotationFormPage.svelte';
	import { quotations } from '$lib/stores/dataStore';

	$: quotationId = $page.params.id ?? '';
	$: quotation = $quotations.find((item) => item.id === quotationId) ?? null;
</script>

{#if quotation}
	<QuotationFormPage {quotation} />
{:else}
	<p class="text-sm text-gray-500 dark:text-slate-400">Quotation not found.</p>
{/if}
