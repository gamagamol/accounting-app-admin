<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import EntityDetailPage from '$lib/components/transactions/EntityDetailPage.svelte';
	import { stockAdjustmentFields } from '$lib/modules/inventory/fields';
	import { stockAdjustments } from '$lib/stores/dataStore';

	$: adjustmentId = $page.params.id ?? '';
	$: adjustment = $stockAdjustments.find((item) => item.id === adjustmentId) ?? null;
</script>

<EntityDetailPage
	title="Stock Adjustment Details"
	description="Review the stock adjustment and its audit trail."
	backHref="/stock-adjustment"
	backLabel="Back to stock adjustments"
	eyebrow="Inventory / Stock Adjustment"
	documentNumber={adjustment?.adjustmentNo ?? ''}
	fields={stockAdjustmentFields}
	row={adjustment}
	auditEntityType="stock_adjustment"
	auditEntityId={adjustment?.id ?? ''}
>
	<svelte:fragment slot="actions">
		{#if adjustment}
			<Button variant="secondary" href={`/stock-adjustment/${adjustment.id}/edit`}>Edit</Button>
		{/if}
	</svelte:fragment>
</EntityDetailPage>
