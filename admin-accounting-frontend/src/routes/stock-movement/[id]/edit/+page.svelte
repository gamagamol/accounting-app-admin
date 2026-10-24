<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EntityFormPage from '$lib/components/transactions/EntityFormPage.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { stockMovementFields } from '$lib/modules/inventory/fields';
	import { stockMovements, inventoryActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';

	$: movementId = $page.params.id ?? '';
	$: movement = $stockMovements.find((item) => item.id === movementId) ?? null;

	function handleSubmit(payload: Record<string, any>) {
		if (!movement) return;
		const before = movement as unknown as Record<string, unknown>;
		inventoryActions.updateMovement(movement.id, payload);
		const after = { ...movement, ...payload } as unknown as Record<string, unknown>;
		auditLogActions.record({
			module: 'inventory',
			entityType: 'stock_movement',
			entityId: movement.id,
			documentNumber: String(payload.docNo ?? movement.docNo),
			action: 'update',
			actor: $user?.name || 'Warehouse Team',
			summary: `Updated stock movement ${payload.docNo ?? movement.docNo}.`,
			before,
			after
		});
		goto(`/stock-movement/${movement.id}`);
	}
</script>

{#if movement}
	<EntityFormPage
		title="Edit Stock Movement"
		description="Update the stock movement on a dedicated page. The audit trail records every change."
		backHref={`/stock-movement/${movement.id}`}
		backLabel="Back to movement details"
		eyebrow="Inventory / Stock Movement"
		documentNumber={movement.docNo}
		fields={stockMovementFields}
		values={movement}
		submitLabel="Save Changes"
		onSubmit={handleSubmit}
		auditEntityType="stock_movement"
		auditEntityId={movement.id}
	/>
{:else}
	<TransactionPageShell
		title="Stock Movement Not Found"
		description="The stock movement may have been deleted or the link is invalid."
		backHref="/stock-movement"
		backLabel="Back to stock movements"
	>
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">No stock movement matches this ID.</p>
		</div>
	</TransactionPageShell>
{/if}
