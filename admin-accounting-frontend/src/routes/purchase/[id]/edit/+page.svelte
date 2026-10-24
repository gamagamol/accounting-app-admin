<script lang="ts">
	import { page } from '$app/stores';
	import PurchaseFormPage from '$lib/modules/purchase/PurchaseFormPage.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { purchaseOrders } from '$lib/stores/dataStore';

	$: purchaseId = $page.params.id ?? '';
	$: purchase = $purchaseOrders.find((item) => item.id === purchaseId) ?? null;
</script>

{#if purchase}
	<PurchaseFormPage {purchase} />
{:else}
	<TransactionPageShell
		title="Purchase Order Not Found"
		description="The purchase order may have been deleted or the link is invalid."
		backHref="/purchase"
		backLabel="Back to purchase orders"
	>
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">No purchase order matches this ID.</p>
		</div>
	</TransactionPageShell>
{/if}
