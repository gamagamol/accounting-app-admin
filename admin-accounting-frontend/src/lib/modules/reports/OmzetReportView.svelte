<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'period', label: 'Period', sortable: true },
		{ key: 'order_count', label: 'Sales Orders', align: 'center', sortable: true },
		{ key: 'gross_sales', label: 'Gross Sales', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'cogs', label: 'Cost of Goods Sold', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'margin', label: 'Gross Profit', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'margin_pct', label: 'Margin (%)', align: 'center', sortable: true, format: (v) => `${v}%` }
	];

	const summary = (rows: Record<string, any>[]) => {
		const gross = sumBy(rows, 'gross_sales');
		const cogs = sumBy(rows, 'cogs');
		const margin = gross - cogs;
		return [
			{ label: 'Total Accumulated Revenue', value: formatCurrency(gross), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Cost of Goods Sold', value: formatCurrency(cogs), tone: 'text-amber-700 dark:text-amber-400' },
			{ label: 'Gross Profit', value: formatCurrency(margin), tone: 'text-emerald-700 dark:text-emerald-400' },
			{ label: 'Average Margin', value: gross > 0 ? `${((margin / gross) * 100).toFixed(1)}%` : '0%', tone: 'text-indigo-700 dark:text-indigo-400' }
		];
	};
</script>

<LiveReport
	slug="omzet"
	{columns}
	{summary}
	searchPlaceholder="Search period..."
	searchKeys={['period']}
	emptyMessage="No sales invoices yet."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'gross_sales'}
			<span class="font-mono font-bold text-blue-700 dark:text-blue-400">{formatCurrency(value)}</span>
		{:else if column.key === 'margin'}
			<span class="font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(value)}</span>
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
