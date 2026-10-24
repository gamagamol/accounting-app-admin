<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import PendingApprovalPanel from '$lib/components/transactions/PendingApprovalPanel.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { goodsReceipts, goodsReceiptActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatDate } from '$lib/utils/formatters';

	export let goodsId: string;

	$: current = $goodsReceipts.find((item) => item.id === goodsId) ?? null;

	function handleDelete() {
		if (!current) return;
		if (!confirm(`Delete goods receipt ${current.receiptNo}? This action cannot be undone.`)) return;
		auditLogActions.record({
			module: 'purchase',
			entityType: 'goods_receipt',
			entityId: current.id,
			documentNumber: current.receiptNo,
			action: 'delete',
			actor: $user?.name || 'Warehouse Admin',
			summary: `Deleted goods receipt ${current.receiptNo}.`,
			description: current.description ?? current.message,
			before: current as unknown as Record<string, unknown>
		});
		goodsReceiptActions.delete(current.id);
		goto('/goods');
	}
</script>

<TransactionPageShell
	title="Goods Receipt Details"
	description="Review the received goods and inspection status. Every change is listed in the audit trail."
	backHref="/goods"
	backLabel="Back to goods receipts"
	eyebrow="Purchasing / Goods Receipt"
	documentNumber={current?.receiptNo ?? ''}
>
	<svelte:fragment slot="actions">
		{#if current}
			<Button variant="secondary" href={`/goods/${current.id}/edit`}>Edit</Button>
			<Button variant="danger" on:click={handleDelete}>Delete</Button>
		{/if}
	</svelte:fragment>

	{#if current}
		<div class="space-y-4 text-xs sm:text-sm">
			<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
					<div>
						<span class="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
							{current.receiptNo}
						</span>
						<h3 class="mt-1 text-lg font-bold text-gray-900 dark:text-white">{current.supplierName}</h3>
						<p class="font-mono text-xs text-gray-500 dark:text-slate-400">Purchase Order: {current.purchaseNo}</p>
					</div>
					<Badge status={current.status} />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
				<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<span class="text-gray-500 dark:text-slate-400">Received Date:</span>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{formatDate(current.date)}</p>
				</div>
				<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<span class="text-gray-500 dark:text-slate-400">Received By:</span>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{current.preparedBy}</p>
				</div>
				<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<span class="text-gray-500 dark:text-slate-400">Total Items:</span>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{current.items.length} line(s)</p>
				</div>
			</div>

			{#if current.description || current.message}
				<div class="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
					<p class="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-200">Description / Message</p>
					<p class="mt-1 whitespace-pre-line text-xs text-blue-900 dark:text-blue-100">{current.description || current.message}</p>
				</div>
			{/if}

			<div class="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
				<table class="min-w-full text-xs">
					<thead class="border-b border-gray-200 bg-slate-50 text-gray-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
						<tr>
							<th class="w-10 p-2.5 text-center">No</th>
							<th class="p-2.5 text-left">Product Name</th>
							<th class="w-20 p-2.5 text-center">Qty</th>
							<th class="w-20 p-2.5 text-center">Unit</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
						{#each current.items as item, index}
							<tr>
								<td class="p-2.5 text-center font-mono text-gray-400">{index + 1}</td>
								<td class="p-2.5 font-medium text-gray-800 dark:text-slate-100">{item.productName}</td>
								<td class="p-2.5 text-center font-semibold">{item.quantity}</td>
								<td class="p-2.5 text-center text-gray-500 dark:text-slate-400">{item.unit}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<PendingApprovalPanel
			transactionType="goods_receipt"
			transactionId={current.id}
			transactionNumber={current.receiptNo}
			status={current.status}
		/>

		<AuditLogPanel entityType="goods_receipt" entityId={current.id} />
	{:else}
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">Goods receipt not found.</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">The record may have been deleted or the link is invalid.</p>
		</div>
	{/if}
</TransactionPageShell>
