<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { salesOrders, deliveries } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	interface FulfillmentRow {
		salesNo: string;
		date: string;
		customerName: string;
		total: number;
		deliveryCount: number;
		deliveryNo: string;
		lastDeliveryDate: string;
		status: string;
		fulfillment: number;
	}

	$: reportData = $salesOrders.map((so) => {
		const related = $deliveries.filter((d) => d.salesNo === so.salesNo);
		const isDelivered = related.some((d) => d.status === 'delivered');
		const isShipped = related.some((d) => d.status === 'shipped');
		const fulfillment = isDelivered ? 100 : isShipped ? 50 : related.length > 0 ? 25 : 0;

		return {
			salesNo: so.salesNo,
			date: so.date,
			customerName: so.customerName,
			total: so.total,
			deliveryCount: related.length,
			deliveryNo: related[0]?.deliveryNo || '-',
			lastDeliveryDate: related[0]?.date || '',
			status: so.status,
			fulfillment
		};
	});

	$: totalValue = reportData.reduce((s, r) => s + r.total, 0);
	$: fullyDelivered = reportData.filter((r) => r.fulfillment === 100).length;
	$: avgFulfillment = reportData.length > 0 ? Math.round(reportData.reduce((s, r) => s + r.fulfillment, 0) / reportData.length) : 0;

	const columns: TableColumn[] = [
		{ key: 'salesNo', label: 'Sales Order No', sortable: true },
		{ key: 'date', label: 'Order Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'total', label: 'Order Value', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'deliveryNo', label: 'Delivery No' },
		{ key: 'deliveryCount', label: 'DO Count', align: 'center' },
		{ key: 'fulfillment', label: 'Fulfillment', align: 'center', sortable: true, format: (v) => `${v}%` },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	$: metrics = [
		{ label: 'Total Order Value', value: formatCurrency(totalValue), tone: 'text-blue-700 dark:text-blue-400' },
		{ label: 'Fully Delivered Orders', value: `${fullyDelivered} / ${reportData.length}`, tone: 'text-emerald-700 dark:text-emerald-400' },
		{ label: 'Average Fulfillment', value: `${avgFulfillment}%`, tone: 'text-indigo-700 dark:text-indigo-400' }
	];
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		{#each metrics as metric}
			<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
				<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">{metric.label}</span>
				<p class="text-xl font-bold {metric.tone} mt-1 font-mono">{metric.value}</p>
			</div>
		{/each}
	</div>

	<div class="flex justify-end gap-2">
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Fulfillment Report</Button>
	</div>

	<DataTable {columns} data={reportData} searchPlaceholder="Search by SO number or customer..." searchKeys={['salesNo', 'customerName', 'deliveryNo']}>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'salesNo'}
				<span class="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
					{value}
				</span>
			{:else if column.key === 'fulfillment'}
				<div class="flex items-center justify-center gap-2">
					<div class="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
						<div
							class="{value === 100 ? 'bg-emerald-600' : value >= 50 ? 'bg-amber-500' : 'bg-rose-500'} h-2 rounded-full"
							style="width: {value}%"
						></div>
					</div>
					<span class="font-bold text-xs font-mono text-gray-700 dark:text-slate-200">{value}%</span>
				</div>
			{:else if column.key === 'status'}
				<Badge status={value} label={value === 'pending' ? 'Pending' : value === 'delivered' ? 'Delivered' : 'Completed'} />
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
