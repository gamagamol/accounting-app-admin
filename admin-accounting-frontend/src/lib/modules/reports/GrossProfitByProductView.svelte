<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'product_code', label: 'Code', sortable: true },
		{ key: 'product_name', label: 'Product', sortable: true },
		{ key: 'quantity_sold', label: 'Qty Sold', align: 'right', sortable: true },
		{ key: 'revenue', label: 'Revenue', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'cogs', label: 'Cost of Goods', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'gross_profit', label: 'Gross Profit', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'margin_pct', label: 'Margin', align: 'center', sortable: true, format: (v) => `${v}%` }
	];

	const summary = (rows: Record<string, any>[]) => {
		const revenue = sumBy(rows, 'revenue');
		const cogs = sumBy(rows, 'cogs');
		const profit = revenue - cogs;
		return [
			{ label: 'Total Revenue', value: formatCurrency(revenue), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Total Cost of Goods', value: formatCurrency(cogs), tone: 'text-amber-700 dark:text-amber-400' },
			{ label: 'Gross Profit', value: formatCurrency(profit), tone: 'text-emerald-700 dark:text-emerald-400' },
			{ label: 'Average Margin', value: revenue > 0 ? `${((profit / revenue) * 100).toFixed(1)}%` : '0%', tone: 'text-indigo-700 dark:text-indigo-400' }
		];
	};
</script>

<LiveReport
	slug="gross-profit"
	{columns}
	{summary}
	searchPlaceholder="Search product..."
	searchKeys={['product_code', 'product_name']}
	emptyMessage="No sales invoice lines yet."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'gross_profit'}
			<span class="font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(value)}</span>
		{:else if column.key === 'margin_pct'}
			<span class="inline-block rounded-full px-2 py-0.5 text-xs font-semibold {Number(value) >= 30 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : Number(value) >= 15 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}">
				{value}%
			</span>
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
