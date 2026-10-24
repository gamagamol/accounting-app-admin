<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EntityFormPage from '$lib/components/transactions/EntityFormPage.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { stockAdjustmentFields } from '$lib/modules/inventory/fields';
	import { stockAdjustments, inventoryActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';

	$: adjustmentId = $page.params.id ?? '';
	$: adjustment = $stockAdjustments.find((item) => item.id === adjustmentId) ?? null;

	function handleSubmit(payload: Record<string, any>) {
		if (!adjustment) return;
		const before = adjustment as unknown as Record<string, unknown>;
		inventoryActions.updateAdjustment(adjustment.id, payload);
		const after = { ...adjustment, ...payload } as unknown as Record<string, unknown>;
		auditLogActions.record({
			module: 'inventory',
			entityType: 'stock_adjustment',
			entityId: adjustment.id,
			documentNumber: String(payload.adjustmentNo ?? adjustment.adjustmentNo),
			action: 'update',
			actor: $user?.name || 'Warehouse Team',
			summary: `Updated stock adjustment ${payload.adjustmentNo ?? adjustment.adjustmentNo}.`,
			before,
			after
		});
		goto(`/stock-adjustment/${adjustment.id}`);
	}
</script>

{#if adjustment}
	<EntityFormPage
		title="Edit Stock Adjustment"
		description="Update the stock adjustment on a dedicated page. The audit trail records every change."
		backHref={`/stock-adjustment/${adjustment.id}`}
		backLabel="Back to adjustment details"
		eyebrow="Inventory / Stock Adjustment"
		documentNumber={adjustment.adjustmentNo}
		fields={stockAdjustmentFields}
		values={adjustment}
		submitLabel="Save Changes"
		onSubmit={handleSubmit}
		auditEntityType="stock_adjustment"
		auditEntityId={adjustment.id}
	/>
{:else}
	<TransactionPageShell
		title="Stock Adjustment Not Found"
		description="The stock adjustment may have been deleted or the link is invalid."
		backHref="/stock-adjustment"
		backLabel="Back to stock adjustments"
	>
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">No stock adjustment matches this ID.</p>
		</div>
	</TransactionPageShell>
{/if}
