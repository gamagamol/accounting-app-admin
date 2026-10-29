<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const transform = (rows: Record<string, any>[]) =>
		rows.map((row) => {
			const ordered = Number(row.ordered_quantity ?? 0);
			const delivered = Number(row.delivered_quantity ?? 0);
			return {
				...row,
				fulfillment: ordered > 0 ? Math.round((delivered / ordered) * 100) : 0
			};
		});

	const columns: TableColumn[] = [
		{ key: 'document_number', label: 'Sales Order No', sortable: true },
		{ key: 'document_date', label: 'Order Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'customer_name', label: 'Customer', sortable: true },
		{ key: 'total_value', label: 'Order Value', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'delivery_count', label: 'DO Count', align: 'center', sortable: true },
		{ key: 'last_delivery_number', label: 'Latest Delivery' },
		{ key: 'ordered_quantity', label: 'Ordered Qty', align: 'right', sortable: true },
		{ key: 'delivered_quantity', label: 'Delivered Qty', align: 'right', sortable: true },
		{ key: 'fulfillment', label: 'Fulfillment', align: 'center', sortable: true, format: (v) => `${v}%` },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	const summary = (rows: Record<string, any>[]) => {
		const totalValue = sumBy(rows, 'total_value');
		const fullyDelivered = rows.filter((row) => Number(row.fulfillment ?? 0) === 100).length;
		const avg = rows.length > 0
			? Math.round(rows.reduce((sum, row) => sum + Number(row.fulfillment ?? 0), 0) / rows.length)
			: 0;
		return [
			{ label: 'Total Order Value', value: formatCurrency(totalValue), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Fully Delivered Orders', value: `${fullyDelivered} / ${rows.length}`, tone: 'text-emerald-700 dark:text-emerald-400' },
			{ label: 'Average Fulfillment', value: `${avg}%`, tone: 'text-indigo-700 dark:text-indigo-400' },
			{ label: 'Orders With Delivery', value: String(rows.filter((row) => Number(row.delivery_count ?? 0) > 0).length), tone: 'text-cyan-700 dark:text-cyan-400' }
		];
	};
</script>

<LiveReport
	slug="order-fulfillment"
	{columns}
	{summary}
	{transform}
	searchPlaceholder="Search by SO number or customer..."
	searchKeys={['document_number', 'customer_name', 'last_delivery_number']}
	emptyMessage="No sales orders yet."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'document_number'}
			<span class="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono font-bold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
				{value}
			</span>
		{:else if column.key === 'fulfillment'}
			<div class="flex items-center justify-center gap-2">
				<div class="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
					<div class="{Number(value) === 100 ? 'bg-emerald-600' : Number(value) >= 50 ? 'bg-amber-500' : 'bg-rose-500'} h-2 rounded-full" style="width: {value}%"></div>
				</div>
				<span class="font-mono text-xs font-bold text-gray-700 dark:text-slate-200">{value}%</span>
			</div>
		{:else if column.key === 'status'}
			<Badge status={value} />
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
