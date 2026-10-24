<script lang="ts">
	import { page } from '$app/stores';
	import SalesFormPage from '$lib/modules/sales/SalesFormPage.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { salesOrders } from '$lib/stores/dataStore';

	$: saleId = $page.params.id ?? '';
	$: sale = $salesOrders.find((item) => item.id === saleId) ?? null;
</script>

{#if sale}
	<SalesFormPage {sale} />
{:else}
	<TransactionPageShell
		title="Sales Order Not Found"
		description="The sales order may have been deleted or the link is invalid."
		backHref="/sales"
		backLabel="Back to sales orders"
	>
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">No sales order matches this ID.</p>
		</div>
	</TransactionPageShell>
{/if}
