<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { billPayments, salesOrders, purchaseOrders } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	$: outstandingBills = $billPayments.filter((b) => b.status === 'pending');
	$: totalOutstandingReceivable = outstandingBills.reduce((sum, b) => sum + b.amount, 0);

	$: pendingDeliveries = $salesOrders.filter((s) => s.status === 'pending');
	$: totalPendingDeliveryValue = pendingDeliveries.reduce((sum, s) => sum + s.total, 0);

	$: pendingPurchases = $purchaseOrders.filter((p) => p.status === 'pending');
	$: totalPendingPurchaseValue = pendingPurchases.reduce((sum, p) => sum + p.total, 0);

	let activeFilter: 'receivable' | 'delivery' | 'purchase' = 'receivable';

	const receivableColumns: TableColumn[] = [
		{ key: 'billNo', label: 'Invoice No', sortable: true },
		{ key: 'date', label: 'Issue Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'supplierName', label: 'Customer', sortable: true },
		{ key: 'invoiceNo', label: 'SO Ref' },
		{ key: 'amount', label: 'Outstanding Amount', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'status', label: 'Collection Status', align: 'center' }
	];

	const deliveryColumns: TableColumn[] = [
		{ key: 'salesNo', label: 'Sales Order No', sortable: true },
		{ key: 'date', label: 'Order Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'total', label: 'Undelivered Value', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'status', label: 'Delivery Status', align: 'center' }
	];

	const purchaseColumns: TableColumn[] = [
		{ key: 'purchaseNo', label: 'Purchase Order No', sortable: true },
		{ key: 'date', label: 'PO Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'supplierName', label: 'Supplier / Vendor', sortable: true },
		{ key: 'total', label: 'Pending Purchase Value', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'status', label: 'Receipt Status', align: 'center' }
	];
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<button
			type="button"
			on:click={() => (activeFilter = 'receivable')}
			class="text-left p-4 rounded-xl border transition-all
             {activeFilter === 'receivable'
				? 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 ring-2 ring-amber-400'
				: 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'}"
		>
			<span class="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Unpaid Receivables</span>
			<p class="text-xl font-bold text-amber-700 dark:text-amber-400 mt-1 font-mono">{formatCurrency(totalOutstandingReceivable)}</p>
			<span class="text-xs text-amber-600 dark:text-amber-300 mt-1 block">{outstandingBills.length} invoices awaiting payment</span>
		</button>

		<button
			type="button"
			on:click={() => (activeFilter = 'delivery')}
			class="text-left p-4 rounded-xl border transition-all
             {activeFilter === 'delivery'
				? 'bg-blue-50/70 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/40 ring-2 ring-blue-400'
				: 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'}"
		>
			<span class="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Pending Deliveries</span>
			<p class="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">{formatCurrency(totalPendingDeliveryValue)}</p>
			<span class="text-xs text-blue-600 dark:text-blue-300 mt-1 block">{pendingDeliveries.length} orders awaiting shipment</span>
		</button>

		<button
			type="button"
			on:click={() => (activeFilter = 'purchase')}
			class="text-left p-4 rounded-xl border transition-all
             {activeFilter === 'purchase'
				? 'bg-rose-50/70 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/40 ring-2 ring-rose-400'
				: 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'}"
		>
			<span class="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Payables / Pending POs</span>
			<p class="text-xl font-bold text-rose-700 dark:text-rose-400 mt-1 font-mono">{formatCurrency(totalPendingPurchaseValue)}</p>
			<span class="text-xs text-rose-600 dark:text-rose-300 mt-1 block">{pendingPurchases.length} POs not yet received</span>
		</button>
	</div>

	<div class="flex justify-between items-center gap-3 flex-wrap">
		<div class="text-xs font-semibold text-gray-700 dark:text-slate-200">
			{#if activeFilter === 'receivable'}
				List of outstanding customer invoices that are not yet paid.
			{:else if activeFilter === 'delivery'}
				List of sales orders that have not been delivered yet.
			{:else}
				List of purchase orders awaiting goods receipt.
			{/if}
		</div>
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Outstanding Report</Button>
	</div>

	{#if activeFilter === 'receivable'}
		<DataTable
			columns={receivableColumns}
			data={outstandingBills}
			searchPlaceholder="Search outstanding invoices..."
			searchKeys={['billNo', 'supplierName', 'invoiceNo']}
		>
			<svelte:fragment slot="cell" let:column let:value let:row>
				{#if column.key === 'billNo'}
					<span class="font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
						{value}
					</span>
				{:else if column.key === 'status'}
					<Badge status="pending" />
				{:else}
					{column.format ? column.format(value, row) : value}
				{/if}
			</svelte:fragment>
		</DataTable>
	{:else if activeFilter === 'delivery'}
		<DataTable
			columns={deliveryColumns}
			data={pendingDeliveries}
			searchPlaceholder="Search pending deliveries..."
			searchKeys={['salesNo', 'customerName']}
		>
			<svelte:fragment slot="cell" let:column let:value let:row>
				{#if column.key === 'salesNo'}
					<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
						{value}
					</span>
				{:else if column.key === 'status'}
					<Badge status="pending" />
				{:else}
					{column.format ? column.format(value, row) : value}
				{/if}
			</svelte:fragment>
		</DataTable>
	{:else}
		<DataTable
			columns={purchaseColumns}
			data={pendingPurchases}
			searchPlaceholder="Search pending purchase orders..."
			searchKeys={['purchaseNo', 'supplierName']}
		>
			<svelte:fragment slot="cell" let:column let:value let:row>
				{#if column.key === 'purchaseNo'}
					<span class="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
						{value}
					</span>
				{:else if column.key === 'status'}
					<Badge status="pending" />
				{:else}
					{column.format ? column.format(value, row) : value}
				{/if}
			</svelte:fragment>
		</DataTable>
	{/if}
</div>
