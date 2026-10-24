<script lang="ts">
	import { goto } from '$app/navigation';
	import EntityFormPage from '$lib/components/transactions/EntityFormPage.svelte';
	import { blankStockMovement, stockMovementFields } from '$lib/modules/inventory/fields';
	import { inventoryActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import type { StockMovement } from '$lib/types';

	function handleSubmit(payload: Record<string, any>) {
		const created = inventoryActions.addMovement(payload as Omit<StockMovement, 'id'>);
		auditLogActions.record({
			module: 'inventory',
			entityType: 'stock_movement',
			entityId: created.id,
			documentNumber: created.docNo,
			action: 'create',
			actor: $user?.name || 'Warehouse Team',
			summary: `Created stock movement ${created.docNo}.`,
			after: created as unknown as Record<string, unknown>
		});
		goto(`/stock-movement/${created.id}`);
	}
</script>

<EntityFormPage
	title="Record Stock Movement"
	description="Create a stock in, stock out, transfer, or adjustment movement on a dedicated page."
	backHref="/stock-movement"
	backLabel="Back to stock movements"
	eyebrow="Inventory / Stock Movement"
	documentNumber="New movement"
	fields={stockMovementFields}
	values={blankStockMovement()}
	submitLabel="Record Movement"
	onSubmit={handleSubmit}
/>
