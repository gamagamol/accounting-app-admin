<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const monthlyOmzet = [
		{ period: 'January 2024', grossSales: 125400000, cogs: 82500000, margin: 42900000, marginPct: 34.2, orders: 12 },
		{ period: 'February 2024', grossSales: 148200000, cogs: 96300000, margin: 51900000, marginPct: 35.0, orders: 15 },
		{ period: 'March 2024', grossSales: 185600000, cogs: 118400000, margin: 67200000, marginPct: 36.2, orders: 18 },
		{ period: 'April 2024 (Current)', grossSales: 162900000, cogs: 104500000, margin: 58400000, marginPct: 35.8, orders: 14 }
	];

	$: totalGross = monthlyOmzet.reduce((s, m) => s + m.grossSales, 0);
	$: totalCogs = monthlyOmzet.reduce((s, m) => s + m.cogs, 0);
	$: totalMargin = monthlyOmzet.reduce((s, m) => s + m.margin, 0);
	$: avgMarginPct = Math.round((totalMargin / totalGross) * 100);

	const columns: TableColumn[] = [
		{ key: 'period', label: 'Period', sortable: true },
		{ key: 'orders', label: 'Transaction Volume', align: 'center', sortable: true, format: (v) => `${v} Orders` },
		{ key: 'grossSales', label: 'Gross Sales', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'cogs', label: 'Cost of Goods Sold', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'margin', label: 'Gross Profit', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'marginPct', label: 'Margin (%)', align: 'center', sortable: true, format: (v) => `${v}%` }
	];

	$: metrics = [
		{ label: 'Total Accumulated Revenue', value: formatCurrency(totalGross), tone: 'text-blue-700 dark:text-blue-400' },
		{ label: 'Cost of Goods Sold', value: formatCurrency(totalCogs), tone: 'text-amber-700 dark:text-amber-400' },
		{ label: 'Gross Profit', value: formatCurrency(totalMargin), tone: 'text-emerald-700 dark:text-emerald-400' },
		{ label: 'Average Margin', value: `${avgMarginPct}%`, tone: 'text-indigo-700 dark:text-indigo-400' }
	];
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
		{#each metrics as metric}
			<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
				<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">{metric.label}</span>
				<p class="text-xl font-bold {metric.tone} mt-1 font-mono">{metric.value}</p>
			</div>
		{/each}
	</div>

	<div class="flex justify-end gap-2">
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Export / Print Monthly Revenue Report</Button>
	</div>

	<DataTable {columns} data={monthlyOmzet} searchPlaceholder="Search period..." searchKeys={['period']}>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'grossSales'}
				<span class="font-mono font-bold text-blue-700 dark:text-blue-400">{formatCurrency(value)}</span>
			{:else if column.key === 'margin'}
				<span class="font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(value)}</span>
			{:else}
				{column.format ? column.format(value, row) : value}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
