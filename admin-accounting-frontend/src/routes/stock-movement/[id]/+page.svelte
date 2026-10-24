<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import EntityDetailPage from '$lib/components/transactions/EntityDetailPage.svelte';
	import { stockMovementFields } from '$lib/modules/inventory/fields';
	import { stockMovements } from '$lib/stores/dataStore';

	$: movementId = $page.params.id ?? '';
	$: movement = $stockMovements.find((item) => item.id === movementId) ?? null;
</script>

<EntityDetailPage
	title="Stock Movement Details"
	description="Review the stock movement and its audit trail."
	backHref="/stock-movement"
	backLabel="Back to stock movements"
	eyebrow="Inventory / Stock Movement"
	documentNumber={movement?.docNo ?? ''}
	fields={stockMovementFields}
	row={movement}
	auditEntityType="stock_movement"
	auditEntityId={movement?.id ?? ''}
>
	<svelte:fragment slot="actions">
		{#if movement}
			<Button variant="secondary" href={`/stock-movement/${movement.id}/edit`}>Edit</Button>
		{/if}
	</svelte:fragment>
</EntityDetailPage>
