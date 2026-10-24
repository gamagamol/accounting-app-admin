<script lang="ts">
	import { goto } from '$app/navigation';
	import EntityFormPage from '$lib/components/transactions/EntityFormPage.svelte';
	import { blankStockAdjustment, stockAdjustmentFields } from '$lib/modules/inventory/fields';
	import { inventoryActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import type { StockAdjustment } from '$lib/types';

	function handleSubmit(payload: Record<string, any>) {
		const created = inventoryActions.addAdjustment(payload as Omit<StockAdjustment, 'id'>);
		auditLogActions.record({
			module: 'inventory',
			entityType: 'stock_adjustment',
			entityId: created.id,
			documentNumber: created.adjustmentNo,
			action: 'create',
			actor: $user?.name || 'Warehouse Team',
			summary: `Created stock adjustment ${created.adjustmentNo}.`,
			after: created as unknown as Record<string, unknown>
		});
		goto(`/stock-adjustment/${created.id}`);
	}
</script>

<EntityFormPage
	title="Add Stock Adjustment"
	description="Record a physical count variance on a dedicated page."
	backHref="/stock-adjustment"
	backLabel="Back to stock adjustments"
	eyebrow="Inventory / Stock Adjustment"
	documentNumber="New adjustment"
	fields={stockAdjustmentFields}
	values={blankStockAdjustment()}
	submitLabel="Create Adjustment"
	onSubmit={handleSubmit}
/>
