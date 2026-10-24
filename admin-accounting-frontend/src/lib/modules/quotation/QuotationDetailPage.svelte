<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PrintPreviewModal from '$lib/components/ui/PrintPreviewModal.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import PendingApprovalPanel from '$lib/components/transactions/PendingApprovalPanel.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { quotations, quotationActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';

	export let quotationId: string;

	let isPrintOpen = false;

	$: current = $quotations.find((item) => item.id === quotationId) ?? null;

	function handleConvert() {
		if (!current) return;
		if (!confirm(`Convert quotation ${current.quotationNo} into a Sales Order?`)) return;
		const before = { ...current } as unknown as Record<string, unknown>;
		const created = quotationActions.convertToSalesOrder(current.id, $user?.name || 'Sales Admin') as
			| { id: string; salesNo: string }
			| null;
		auditLogActions.record({
			module: 'sales',
			entityType: 'quotation',
			entityId: current.id,
			documentNumber: current.quotationNo,
			action: 'post',
			actor: $user?.name || 'Sales Admin',
			summary: `Converted quotation ${current.quotationNo} into sales order ${created?.salesNo ?? ''}.`,
			description: current.description ?? current.message ?? `Quotation converted into sales order ${created?.salesNo ?? ''}.`,
			before,
			after: { ...current, status: 'completed' } as unknown as Record<string, unknown>
		});
		if (created) goto(`/sales/${created.id}`);
	}

	function handleDelete() {
		if (!current) return;
		if (!confirm(`Delete quotation ${current.quotationNo}? This action cannot be undone.`)) return;
		auditLogActions.record({
			module: 'sales',
			entityType: 'quotation',
			entityId: current.id,
			documentNumber: current.quotationNo,
			action: 'delete',
			actor: $user?.name || 'Sales Admin',
			summary: `Deleted quotation ${current.quotationNo}.`,
			description: current.description ?? current.message,
			before: current as unknown as Record<string, unknown>
		});
		quotationActions.delete(current.id);
		goto('/quotation');
	}
</script>

<TransactionPageShell
	title="Quotation Details"
	description="Review the quotation, print it, or convert it into a sales order. Every change is listed in the audit trail."
	backHref="/quotation"
	backLabel="Back to quotations"
	eyebrow="Sales / Quotation"
	documentNumber={current?.quotationNo ?? ''}
>
	<svelte:fragment slot="actions">
		{#if current}
			<Button variant="secondary" href={`/quotation/${current.id}/edit`}>Edit</Button>
			<Button variant="secondary" on:click={() => (isPrintOpen = true)}>Print</Button>
			<Button variant="danger" on:click={handleDelete}>Delete</Button>
		{/if}
	</svelte:fragment>

	{#if current}
		<div class="space-y-4 text-xs sm:text-sm">
			<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
					<div>
						<span class="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
							{current.quotationNo}
						</span>
						<h3 class="mt-1 text-lg font-bold text-gray-900 dark:text-white">{current.customerName}</h3>
						<p class="font-mono text-xs text-gray-500 dark:text-slate-400">No. Transaksi: {current.transactionNo}</p>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<Badge status={current.status} />
						{#if current.status === 'draft' || current.status === 'created'}
							<Button size="sm" variant="success" on:click={handleConvert}>Convert to Sales Order</Button>
						{/if}
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
				<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<span class="text-gray-500 dark:text-slate-400">Quotation Date:</span>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{formatDate(current.date)}</p>
				</div>
				<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<span class="text-gray-500 dark:text-slate-400">Prepared By:</span>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{current.preparedBy}</p>
				</div>
				<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<span class="text-gray-500 dark:text-slate-400">Sales Person:</span>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{current.salesPerson}</p>
				</div>
				<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<span class="text-gray-500 dark:text-slate-400">Total Amount:</span>
					<p class="mt-0.5 font-mono font-bold text-blue-700 dark:text-blue-300">{formatCurrency(current.total)}</p>
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

			<div class="flex flex-col justify-between gap-4 sm:flex-row">
				<div class="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60">
					<span class="font-bold text-gray-700 dark:text-slate-200">Notes:</span>
					<p class="mt-1 italic text-gray-600 dark:text-slate-400">{current.notes || '-'}</p>
				</div>
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
						<span class="font-mono text-blue-700 dark:text-blue-300">{formatCurrency(current.total)}</span>
					</div>
				</div>
			</div>
		</div>

		<PendingApprovalPanel
			transactionType="quotation"
			transactionId={current.id}
			transactionNumber={current.quotationNo}
			status={current.status}
		/>

		<AuditLogPanel entityType="quotation" entityId={current.id} />

		<PrintPreviewModal
			bind:isOpen={isPrintOpen}
			documentType="quotation"
			documentNo={current.quotationNo}
			date={current.date}
			customerOrSupplierName={current.customerName}
			items={current.items}
			subtotal={current.subtotal}
			tax={current.tax}
			total={current.total}
			notes={current.notes}
			preparedBy={current.preparedBy}
		/>
	{:else}
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">Quotation not found.</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">The record may have been deleted or the link is invalid.</p>
		</div>
	{/if}
</TransactionPageShell>
