<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PrintPreviewModal from '$lib/components/ui/PrintPreviewModal.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import PendingApprovalPanel from '$lib/components/transactions/PendingApprovalPanel.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { salesOrders, salesActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';

	export let saleId: string;

	let isPrintOpen = false;

	$: current = $salesOrders.find((item) => item.id === saleId) ?? null;

	function handleCreateDelivery() {
		if (!current) return;
		if (!confirm(`Create a Delivery Order for sales order ${current.salesNo}?`)) return;
		const before = { ...current } as unknown as Record<string, unknown>;
		salesActions.createDelivery(current.id, $user?.name || 'Logistics Lead');
		const after = { ...current, status: 'completed' } as unknown as Record<string, unknown>;
		auditLogActions.record({
			module: 'sales',
			entityType: 'sales_order',
			entityId: current.id,
			documentNumber: current.salesNo,
			action: 'update',
			actor: $user?.name || 'Logistics Lead',
			summary: `Created delivery order for ${current.salesNo}.`,
			description: current.description ?? current.message ?? `Delivery order created from sales order ${current.salesNo}.`,
			before,
			after
		});
	}

	function handleCreateBill() {
		if (!current) return;
		if (!confirm(`Issue an invoice for sales order ${current.salesNo}?`)) return;
		const before = { ...current } as unknown as Record<string, unknown>;
		salesActions.createBill(current.id, $user?.name || 'Finance Team');
		auditLogActions.record({
			module: 'sales',
			entityType: 'sales_order',
			entityId: current.id,
			documentNumber: current.salesNo,
			action: 'post',
			actor: $user?.name || 'Finance Team',
			summary: `Issued invoice for ${current.salesNo}.`,
			description: current.description ?? current.message ?? `Invoice issued for sales order ${current.salesNo}.`,
			before,
			after: { ...current } as unknown as Record<string, unknown>
		});
	}

	function handleDelete() {
		if (!current) return;
		if (!confirm(`Delete sales order ${current.salesNo}? This action cannot be undone.`)) return;
		auditLogActions.record({
			module: 'sales',
			entityType: 'sales_order',
			entityId: current.id,
			documentNumber: current.salesNo,
			action: 'delete',
			actor: $user?.name || 'Sales Admin',
			summary: `Deleted sales order ${current.salesNo}.`,
			description: current.description ?? current.message,
			before: current as unknown as Record<string, unknown>
		});
		salesActions.delete(current.id);
		goto('/sales');
	}
</script>

<TransactionPageShell
	title="Sales Order Details"
	description="Review the sales order, continue the delivery and invoice flow, and inspect its audit trail."
	backHref="/sales"
	backLabel="Back to sales orders"
	eyebrow="Sales / Sales Order"
	documentNumber={current?.salesNo ?? ''}
>
	<svelte:fragment slot="actions">
		{#if current}
			<Button variant="secondary" href={`/sales/${current.id}/edit`}>Edit</Button>
			<Button variant="secondary" on:click={() => (isPrintOpen = true)}>Print SO</Button>
			<Button variant="danger" on:click={handleDelete}>Delete</Button>
		{/if}
	</svelte:fragment>

	{#if current}
		<div class="space-y-4 text-xs sm:text-sm">
			<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
					<div>
						<span class="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
							{current.salesNo}
						</span>
						<h3 class="mt-1 text-lg font-bold text-gray-900 dark:text-white">{current.customerName}</h3>
						<p class="font-mono text-xs text-gray-500 dark:text-slate-400">No. Transaksi: {current.transactionNo}</p>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<Badge status={current.status} />
						{#if current.status === 'pending'}
							<Button size="sm" variant="warning" on:click={handleCreateDelivery}>Create Delivery Order</Button>
						{/if}
						<Button size="sm" variant="primary" on:click={handleCreateBill}>Issue Invoice</Button>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
				<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<span class="text-gray-500 dark:text-slate-400">Order Date:</span>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{formatDate(current.date)}</p>
				</div>
				<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<span class="text-gray-500 dark:text-slate-400">Prepared By:</span>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{current.preparedBy}</p>
				</div>
				<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<span class="text-gray-500 dark:text-slate-400">Order Total:</span>
					<p class="mt-0.5 font-mono font-bold text-indigo-700 dark:text-indigo-300">{formatCurrency(current.total)}</p>
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
							<th class="w-16 p-2.5 text-center">Qty</th>
							<th class="w-16 p-2.5 text-center">Unit</th>
							<th class="w-28 p-2.5 text-right">Unit Price</th>
							<th class="w-16 p-2.5 text-center">Discount</th>
							<th class="w-32 p-2.5 text-right">Total</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
						{#each current.items as item, index}
							<tr>
								<td class="p-2.5 text-center font-mono text-gray-400">{index + 1}</td>
								<td class="p-2.5 font-medium text-gray-800 dark:text-slate-100">{item.productName}</td>
								<td class="p-2.5 text-center font-semibold">{item.quantity}</td>
								<td class="p-2.5 text-center text-gray-500 dark:text-slate-400">{item.unit}</td>
								<td class="p-2.5 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
								<td class="p-2.5 text-center">{item.discount ? `${item.discount}%` : '-'}</td>
								<td class="p-2.5 text-right font-mono font-semibold">{formatCurrency(item.total)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="flex justify-end">
				<div class="w-full space-y-1 text-xs sm:w-64">
					<div class="flex justify-between text-gray-600 dark:text-slate-300">
						<span>Subtotal:</span>
						<span class="font-mono">{formatCurrency(current.subtotal)}</span>
					</div>
					<div class="flex justify-between text-gray-600 dark:text-slate-300">
						<span>VAT 11%:</span>
						<span class="font-mono">{formatCurrency(current.tax)}</span>
					</div>
					<div class="flex justify-between border-t border-gray-200 pt-1 text-sm font-bold text-gray-900 dark:border-slate-800 dark:text-white">
						<span>Total:</span>
						<span class="font-mono text-indigo-700 dark:text-indigo-300">{formatCurrency(current.total)}</span>
					</div>
				</div>
			</div>
		</div>

		<PendingApprovalPanel
			transactionType="sales_order"
			transactionId={current.id}
			transactionNumber={current.salesNo}
			status={current.status}
		/>

		<AuditLogPanel entityType="sales_order" entityId={current.id} />

		<PrintPreviewModal
			bind:isOpen={isPrintOpen}
			documentType="sales"
			documentNo={current.salesNo}
			date={current.date}
			customerOrSupplierName={current.customerName}
			items={current.items}
			subtotal={current.subtotal}
			tax={current.tax}
			total={current.total}
			preparedBy={current.preparedBy}
		/>
	{:else}
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">Sales order not found.</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">The record may have been deleted or the link is invalid.</p>
		</div>
	{/if}
</TransactionPageShell>
