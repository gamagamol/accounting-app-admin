<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { getReport, type ReportRow } from '$lib/api/reports';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';

	let rows: ReportRow[] = [];
	let loading = true;
	let error = '';
	let selectedKey = '';

	function rowKey(row: ReportRow): string {
		return `${row.sales_order_id}-${row.delivery_id ?? 'x'}-${row.sales_invoice_id ?? 'x'}-${row.customer_receipt_id ?? 'x'}`;
	}

	async function load() {
		loading = true;
		error = '';
		try {
			const result = await getReport('transaction-tracking');
			rows = Array.isArray(result.data) ? result.data : [];
			selectedKey = rows.length > 0 ? rowKey(rows[0]) : '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load transaction tracking report';
		} finally {
			loading = false;
		}
	}

	$: activeTrx = rows.find((row) => rowKey(row) === selectedKey) ?? rows[0] ?? null;

	onMount(load);
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<p class="text-xs text-gray-500 dark:text-slate-400">
			Realtime sales lifecycle: quotation, sales order, delivery ticket, invoice ticket, and receipt.
		</p>
		<Button size="sm" variant="secondary" on:click={load} disabled={loading}>
			{loading ? 'Refreshing...' : 'Refresh'}
		</Button>
	</div>

	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	{#if loading && rows.length === 0}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading transaction tracking...
		</div>
	{:else if rows.length === 0}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			No sales orders to track yet.
		</div>
	{:else}
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="w-full sm:w-96">
					<label for="tracking-ticket" class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
						Select transaction ticket
					</label>
					<select
						id="tracking-ticket"
						bind:value={selectedKey}
						class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100"
					>
						{#each rows as row}
							<option value={rowKey(row)}>
								{row.sales_order_number}
								{row.delivery_number ? `— ${row.delivery_number}` : ''}
								{row.sales_invoice_number ? `— ${row.sales_invoice_number}` : ''}
							</option>
						{/each}
					</select>
				</div>

				{#if activeTrx}
					<div class="text-left sm:text-right">
						<span class="text-xs text-gray-500 dark:text-slate-400">Customer</span>
						<p class="text-sm font-bold text-gray-900 dark:text-white">{activeTrx.customer_name}</p>
						<span class="text-[11px] text-gray-500 dark:text-slate-400">
							Quotation date: {activeTrx.quotation_date ? formatDate(activeTrx.quotation_date) : '-'}
						</span>
					</div>
				{/if}
			</div>
		</div>

		{#if activeTrx}
			<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<h4 class="mb-6 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
					<span>🚀</span>
					<span>Transaction Lifecycle</span>
				</h4>

				<div class="grid grid-cols-1 gap-3 md:grid-cols-5">
					<div class="rounded-xl border p-3 {activeTrx.quotation_id ? 'border-blue-300 bg-blue-50/70 dark:border-blue-500/30 dark:bg-blue-500/10' : 'border-gray-200 bg-gray-50 opacity-50 dark:border-slate-800 dark:bg-slate-800/40'}">
						<div class="mb-1 flex items-center justify-between">
							<span class="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-300">1. Quotation</span>
							<span class="text-xs">{activeTrx.quotation_id ? '✅' : '⏳'}</span>
						</div>
						<p class="truncate font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
							{activeTrx.quotation_number || 'Direct Order'}
						</p>
						<p class="mt-0.5 font-mono text-[11px] text-gray-500 dark:text-slate-400">
							{activeTrx.quotation_total ? formatCurrency(activeTrx.quotation_total) : '-'}
						</p>
						<span class="mt-2 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-200">
							{activeTrx.quotation_date ? formatDate(activeTrx.quotation_date) : 'No quotation'}
						</span>
					</div>

					<div class="rounded-xl border p-3 {activeTrx.sales_order_id ? 'border-indigo-300 bg-indigo-50/70 dark:border-indigo-500/30 dark:bg-indigo-500/10' : 'border-gray-200 bg-gray-50 opacity-50 dark:border-slate-800 dark:bg-slate-800/40'}">
						<div class="mb-1 flex items-center justify-between">
							<span class="text-[10px] font-bold uppercase text-indigo-800 dark:text-indigo-300">2. Sales Order</span>
							<span class="text-xs">{activeTrx.sales_order_id ? '✅' : '⏳'}</span>
						</div>
						<p class="truncate font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
							{activeTrx.sales_order_number || 'Not Issued'}
						</p>
						<p class="mt-0.5 font-mono text-[11px] text-gray-500 dark:text-slate-400">
							{activeTrx.sales_order_total ? formatCurrency(activeTrx.sales_order_total) : '-'}
						</p>
						<span class="mt-2 inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200">
							{activeTrx.sales_order_date ? formatDate(activeTrx.sales_order_date) : 'Deal'}
						</span>
					</div>

					<div class="rounded-xl border p-3 {activeTrx.delivery_id ? 'border-cyan-300 bg-cyan-50/70 dark:border-cyan-500/30 dark:bg-cyan-500/10' : 'border-gray-200 bg-gray-50 opacity-50 dark:border-slate-800 dark:bg-slate-800/40'}">
						<div class="mb-1 flex items-center justify-between">
							<span class="text-[10px] font-bold uppercase text-cyan-800 dark:text-cyan-300">3. Delivery</span>
							<span class="text-xs">{activeTrx.delivery_id ? '✅' : '⏳'}</span>
						</div>
						<p class="truncate font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
							{activeTrx.delivery_number || 'Awaiting Shipment'}
						</p>
						<p class="mt-0.5 text-[11px] text-gray-500 dark:text-slate-400">
							{activeTrx.delivery_date ? formatDate(activeTrx.delivery_date) : 'Not delivered'}
						</p>
						<span class="mt-2 inline-block rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-200">
							{activeTrx.delivery_status || 'Logistics'}
						</span>
					</div>

					<div class="rounded-xl border p-3 {activeTrx.sales_invoice_id ? 'border-amber-300 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/10' : 'border-gray-200 bg-gray-50 opacity-50 dark:border-slate-800 dark:bg-slate-800/40'}">
						<div class="mb-1 flex items-center justify-between">
							<span class="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">4. Invoice</span>
							<span class="text-xs">{activeTrx.sales_invoice_id ? '✅' : '⏳'}</span>
						</div>
						<p class="truncate font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
							{activeTrx.sales_invoice_number || 'Not Invoiced'}
						</p>
						<p class="mt-0.5 font-mono text-[11px] text-gray-500 dark:text-slate-400">
							{activeTrx.sales_invoice_total ? formatCurrency(activeTrx.sales_invoice_total) : '-'}
						</p>
						<span class="mt-2 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
							{activeTrx.invoice_status || 'Billing'}
						</span>
					</div>

					<div class="rounded-xl border p-3 {activeTrx.customer_receipt_id ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10' : 'border-gray-200 bg-gray-50 opacity-50 dark:border-slate-800 dark:bg-slate-800/40'}">
						<div class="mb-1 flex items-center justify-between">
							<span class="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">5. Receipt</span>
							<span class="text-xs">{activeTrx.customer_receipt_id ? '🎉' : '⏳'}</span>
						</div>
						<p class="truncate font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
							{activeTrx.customer_receipt_number || 'Pending Payment'}
						</p>
						<p class="mt-0.5 font-mono text-[11px] text-gray-500 dark:text-slate-400">
							{activeTrx.customer_receipt_total ? formatCurrency(activeTrx.customer_receipt_total) : '-'}
						</p>
						<span class="mt-2 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
							{activeTrx.customer_receipt_id ? activeTrx.receipt_status : 'Outstanding'}
						</span>
					</div>
				</div>

				<div class="mt-6 grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 text-sm dark:border-slate-800 sm:grid-cols-3">
					<div>
						<span class="text-xs text-gray-500 dark:text-slate-400">Invoice paid</span>
						<p class="font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(activeTrx.invoice_paid_amount ?? 0)}</p>
					</div>
					<div>
						<span class="text-xs text-gray-500 dark:text-slate-400">Invoice outstanding</span>
						<p class="font-mono font-bold {Number(activeTrx.invoice_outstanding_amount ?? 0) > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}">
							{formatCurrency(activeTrx.invoice_outstanding_amount ?? 0)}
						</p>
					</div>
					<div>
						<span class="text-xs text-gray-500 dark:text-slate-400">Ticket status</span>
						<div class="mt-1">
							<Badge status={activeTrx.customer_receipt_id ? 'completed' : activeTrx.sales_invoice_id ? 'approved' : 'pending'} />
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
