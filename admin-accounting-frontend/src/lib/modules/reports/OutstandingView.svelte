<script lang="ts">
	import { onMount } from 'svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { getReport, type ReportRow } from '$lib/api/reports';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	let rows: ReportRow[] = [];
	let loading = true;
	let error = '';
	let activeFilter: 'receivable' | 'delivery' | 'purchase' | 'payable' = 'receivable';

	async function load() {
		loading = true;
		error = '';
		try {
			const result = await getReport('outstanding');
			rows = Array.isArray(result.data) ? result.data : [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load outstanding report';
		} finally {
			loading = false;
		}
	}

	$: receivables = rows.filter((row) => row.category === 'receivable');
	$: payables = rows.filter((row) => row.category === 'payable');
	$: pendingDeliveries = rows.filter((row) => row.category === 'pending_delivery');
	$: pendingPurchases = rows.filter((row) => row.category === 'pending_purchase');
	$: totalReceivable = receivables.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
	$: totalPayable = payables.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
	$: totalPendingDelivery = pendingDeliveries.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
	$: totalPendingPurchase = pendingPurchases.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

	$: activeRows =
		activeFilter === 'receivable'
			? receivables
			: activeFilter === 'payable'
				? payables
				: activeFilter === 'delivery'
					? pendingDeliveries
					: pendingPurchases;

	const columns: TableColumn[] = [
		{ key: 'document_number', label: 'Document No', sortable: true },
		{ key: 'party_name', label: 'Party', sortable: true },
		{ key: 'document_date', label: 'Document Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'due_date', label: 'Due Date', sortable: true, format: (v) => (v ? formatDate(v) : '-') },
		{ key: 'amount', label: 'Outstanding Amount', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	onMount(load);
</script>

<div class="space-y-6">
	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
		<button
			type="button"
			on:click={() => (activeFilter = 'receivable')}
			class="rounded-xl border p-4 text-left transition-all {activeFilter === 'receivable' ? 'border-amber-300 bg-amber-50/70 ring-2 ring-amber-400 dark:border-amber-500/40 dark:bg-amber-500/10' : 'border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900'}"
		>
			<span class="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">Unpaid Receivables</span>
			<p class="mt-1 font-mono text-xl font-bold text-amber-700 dark:text-amber-400">{formatCurrency(totalReceivable)}</p>
			<span class="mt-1 block text-xs text-amber-600 dark:text-amber-300">{receivables.length} invoices</span>
		</button>
		<button
			type="button"
			on:click={() => (activeFilter = 'payable')}
			class="rounded-xl border p-4 text-left transition-all {activeFilter === 'payable' ? 'border-rose-300 bg-rose-50/70 ring-2 ring-rose-400 dark:border-rose-500/40 dark:bg-rose-500/10' : 'border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900'}"
		>
			<span class="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">Unpaid Payables</span>
			<p class="mt-1 font-mono text-xl font-bold text-rose-700 dark:text-rose-400">{formatCurrency(totalPayable)}</p>
			<span class="mt-1 block text-xs text-rose-600 dark:text-rose-300">{payables.length} invoices</span>
		</button>
		<button
			type="button"
			on:click={() => (activeFilter = 'delivery')}
			class="rounded-xl border p-4 text-left transition-all {activeFilter === 'delivery' ? 'border-blue-300 bg-blue-50/70 ring-2 ring-blue-400 dark:border-blue-500/40 dark:bg-blue-500/10' : 'border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900'}"
		>
			<span class="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">Pending Deliveries</span>
			<p class="mt-1 font-mono text-xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(totalPendingDelivery)}</p>
			<span class="mt-1 block text-xs text-blue-600 dark:text-blue-300">{pendingDeliveries.length} sales orders</span>
		</button>
		<button
			type="button"
			on:click={() => (activeFilter = 'purchase')}
			class="rounded-xl border p-4 text-left transition-all {activeFilter === 'purchase' ? 'border-emerald-300 bg-emerald-50/70 ring-2 ring-emerald-400 dark:border-emerald-500/40 dark:bg-emerald-500/10' : 'border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900'}"
		>
			<span class="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Pending Purchases</span>
			<p class="mt-1 font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalPendingPurchase)}</p>
			<span class="mt-1 block text-xs text-emerald-600 dark:text-emerald-300">{pendingPurchases.length} purchase orders</span>
		</button>
	</div>

	<div class="flex flex-wrap items-center justify-between gap-3">
		<p class="text-xs text-gray-500 dark:text-slate-400">Realtime outstanding report from posted invoices and open orders.</p>
		<Button size="sm" variant="secondary" on:click={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
	</div>

	{#if loading}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading outstanding report...
		</div>
	{:else}
		<DataTable
			{columns}
			data={activeRows}
			searchPlaceholder="Search document or party..."
			searchKeys={['document_number', 'party_name', 'status']}
			emptyMessage="No outstanding documents in this category."
		>
			<svelte:fragment slot="cell" let:column let:value let:row>
				{#if column.key === 'document_number'}
					<span class="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono font-bold text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
						{value}
					</span>
				{:else if column.key === 'amount'}
					<span class="font-mono font-bold text-rose-700 dark:text-rose-400">{formatCurrency(value)}</span>
				{:else if column.key === 'status'}
					<Badge status={value} />
				{:else}
					{column.format ? column.format(value, row) : value ?? '-'}
				{/if}
			</svelte:fragment>
		</DataTable>
	{/if}
</div>
